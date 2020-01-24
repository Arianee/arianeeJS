import { injectable } from 'tsyringe';
import { CertificateId } from '../../../../models/CertificateId';
import { StoreNamespace } from '../../../../models/storeNamespace';
import { ArianeeHttpClient } from '../../../libs/arianeeHttpClient/arianeeHttpClient';
import { SimpleStore } from '../../../libs/simpleStore/simpleStore';
import { CertificateSummaryBuilder } from '../../certificateSummary';
import {
  CertificateContentContainer,
  ConsolidatedCertificateRequest,
  ConsolidatedIssuerRequestInterface
} from '../../certificateSummary/certificateSummary';
import { ConfigurationService } from '../configurationService/configurationService';
import { ContractService } from '../contractService/contractsService';
import { IdentityService } from '../identityService/identityService';
import { UtilsService } from '../utilService/utilsService';
import { WalletService } from '../walletService/walletService';

@injectable()
export class CertificateDetails {
  constructor (
    private identityService: IdentityService,
    private httpClient: ArianeeHttpClient,
    private contractService: ContractService,
    private configurationService: ConfigurationService,
    private walletService: WalletService,
    private utils: UtilsService,
    private store: SimpleStore) {

  }

  public getCertificateIssuer = async (parameters:{certificateId: CertificateId, query: ConsolidatedCertificateRequest}) => {
    return this.fetchCertificateIssuer(parameters);
  }

  public fetchCertificateIssuer = async (
    parameters:{certificateId: CertificateId, query: ConsolidatedCertificateRequest}) => {
    const { certificateId } = parameters;

    const issuerOf = () => this.contractService.smartAssetContract.methods
      .issuerOf(certificateId.toString())
      .call();

    const address = await this.store.get<string>(StoreNamespace.certificateIssuer, certificateId, issuerOf);

    return this.identityService.getIdentity({
      ...parameters,
      address
    });
  }

  public getCertificateOwner = async (
    certificateId: CertificateId,
    certificateBuilder?: CertificateSummaryBuilder
  ) => {
    const owner = await this.contractService.smartAssetContract.methods
      .ownerOf(certificateId.toString())
      .call();

    if (certificateBuilder) certificateBuilder.setOwner(owner, this.walletService.publicKey);

    return owner;
  }

  private getCertificateContentFromHttp = async certificateURI => {
    return this.httpClient.fetch(
      certificateURI
    );
  }

  private getCertificateContentFromRPC = async (
    parameters:{
      certificateURI: string, certificateId: string, proof: any, query: ConsolidatedCertificateRequest
    }
  ) => {
    const { certificateId, query, proof } = parameters;
    const issuer = query.issuer as ConsolidatedIssuerRequestInterface;

    let rpcEndPoint;
    if (issuer.rpcURI) {
      rpcEndPoint = issuer.rpcURI;
    } else {
      const address = await this.contractService.smartAssetContract.methods
        .issuerOf(certificateId)
        .call();

      const identity = await this.identityService.getIdentity({
        ...parameters,
        address
      })
        .then(d => {
          if (d.data === undefined) {
            console.error(`# ${parameters.certificateURI} # failing to retrieve identity`);
          };
          return d;
        });

      rpcEndPoint = identity.data.rpcEndpoint;
    }

    return this.httpClient.RPCCall(
      rpcEndPoint,
      'certificate.read',
      {
        certificateId: certificateId,
        authentification: {
          hash: proof.messageHash,
          signature: proof.signature,
          message: proof.message
        }
      }
    );
  }

  private getContent = (parameters:{
    certificateURI:string, certificateId:string, proof:any, query:ConsolidatedCertificateRequest
  }) => {
    const { certificateURI, certificateId } = parameters;
    return this.getCertificateContentFromRPC(parameters)
      .catch(err => {
        console.error(`# ${certificateId} # Impossible to fetch content from RPC server ${certificateURI}`);
        console.error(`# ${certificateId} # Fallback to simple http call ${certificateURI}`);

        return this.getCertificateContentFromHttp(parameters.certificateURI);
      })
      .catch(d => console.log(`# ${certificateId} # Impossible to fetch content of this certificate ${parameters.certificateId}`));
  }

  public getCertificateContent = (
    parameters:{
      certificateId: CertificateId,
      passphrase?:string,
      query:ConsolidatedCertificateRequest
    }
  ) => {
    const { certificateId } = parameters;
    return this.store.get<CertificateContentContainer>(StoreNamespace.certificateContent, certificateId, () => this.fetchCertificateContent(parameters));
  }

  private fetchCertificateContent = async (
    parameters:{ certificateId: CertificateId,
        passphrase?:string,
        query:ConsolidatedCertificateRequest}
  ) => {
    const { certificateId, passphrase } = parameters;

    const generateProof = () => {
      if (passphrase) {
        const temporaryWallet = this.configurationService.walletFactory()
          .fromPassPhrase(passphrase);
        return this.utils.signProof(
          JSON.stringify({
            certificateId: certificateId,
            timestamp: new Date()
          }),
          temporaryWallet.privateKey
        );
      } else {
        return this.utils.signProof(
          JSON.stringify({
            certificateId: certificateId,
            timestamp: new Date()
          }),
          this.walletService.privateKey
        );
      }
    };

    const tokenURI = await this.contractService.smartAssetContract.methods
      .tokenURI(certificateId.toString())
      .call();

    const certificateContentData: any = await this.getContent(
      {
        ...parameters,
        proof: generateProof(),
        certificateURI: tokenURI
      }
    );

    const certificateSchema = await this.httpClient.fetch(
      certificateContentData.$schema
    );

    const hash = await this.utils.cert(
      certificateSchema,
      certificateContentData
    );

    const tokenImprint = await this.contractService.smartAssetContract.methods
      .tokenImprint(certificateId.toString())
      .call();

    const isCertificateContentValid = hash === tokenImprint;

    return Promise.resolve({ imprint: tokenImprint, data: certificateContentData, isAuthentic: isCertificateContentValid });
  }
}
