import { get } from 'lodash';
import { injectable } from 'tsyringe';
import { ArianeeGateWayAuthentification } from '../../../../models/ArianeeGateWayAuthentification';
import { ArianeeTokenId } from '../../../../models/ArianeeTokenId';
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

  public getCertificateIssuer = async (parameters:{certificateId: ArianeeTokenId, query: ConsolidatedCertificateRequest}) => {
    return this.fetchCertificateIssuer(parameters);
  }

  public fetchCertificateIssuer = async (
    parameters:{certificateId: ArianeeTokenId, query: ConsolidatedCertificateRequest}) => {
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
    certificateId: ArianeeTokenId,
    certificateBuilder?: CertificateSummaryBuilder
  ) => {
    const owner = await this.contractService.smartAssetContract.methods
      .ownerOf(certificateId.toString())
      .call();

    if (certificateBuilder) certificateBuilder.setOwner(owner, this.walletService.address);

    return owner;
  }

  private getCertificateContentFromHttp = async certificateURI => {
    return this.httpClient.fetch(
      certificateURI
    );
  }

  private getCertificateContentFromRPC = async (
    parameters:{
      certificateURI: string, certificateId: string, arianeeRPCAuthentification: ArianeeGateWayAuthentification, query: ConsolidatedCertificateRequest
    }
  ) => {
    const { certificateId, query, arianeeRPCAuthentification } = parameters;
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
            console.warn(`# ${parameters.certificateURI} # failing to retrieve identity`);
          };
          return d;
        });

      rpcEndPoint = identity.data.rpcEndpoint;
    }

    const certificateRPCResult = await this.httpClient.RPCCall<CertificateContentContainer>(
      rpcEndPoint,
      'update.read',
      {
        certificateId: certificateId,
        authentification: arianeeRPCAuthentification
      }
    );

    return certificateRPCResult.result;
  }

  private getContent = (parameters:{
    certificateURI:string, certificateId:string, arianeeRPCAuthentification:any, query:ConsolidatedCertificateRequest
  }) => {
    const { certificateURI, certificateId } = parameters;
    return this.getCertificateContentFromRPC(parameters)
      .catch(err => {
        console.warn(`# ${certificateId} # Impossible to fetch content from RPC server`);
        console.warn(`# ${certificateId} # Fallback to simple http call ${certificateURI}`);

        return this.getCertificateContentFromHttp(parameters.certificateURI);
      })
      .catch(d => console.warn(`# ${certificateId} # Impossible to fetch content of this certificate ${parameters.certificateId}`));
  }

  public getCertificateContent = (
    parameters:{
      certificateId: ArianeeTokenId,
      passphrase?:string,
      query:ConsolidatedCertificateRequest
    }
  ) => {
    const { certificateId } = parameters;
    return this.store.get<CertificateContentContainer>(StoreNamespace.certificateContent, certificateId, () => this.fetchCertificateContent(parameters));
  }

  private fetchCertificateContent = async (
    parameters:{ certificateId: ArianeeTokenId,
        passphrase?:string,
        query:ConsolidatedCertificateRequest}
  ) => {
    const { certificateId, passphrase } = parameters;

    const generateProof = ():ArianeeGateWayAuthentification => {
      if (get(parameters, 'query.advanced.arianeeProofToken')) {
        return {
          bearer: parameters.query.advanced.arianeeProofToken,
          jwt: parameters.query.advanced.arianeeProofToken
        };
      } else if (passphrase) {
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
        arianeeRPCAuthentification: generateProof(),
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

    const tokenImprint = await this.contractService.updateSmartAssetContract.methods
      .getImprint(certificateId.toString())
      .call();

    const isCertificateContentValid = hash === tokenImprint;

    return Promise.resolve({ imprint: tokenImprint, data: certificateContentData, isAuthentic: isCertificateContentValid });
  }
}
