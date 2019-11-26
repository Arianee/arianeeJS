import { injectable } from 'tsyringe';
import { CertificateId } from '../../../../models/CertificateId';
import { ArianeeHttpClient } from '../../../libs/arianeeHttpClient/arianeeHttpClient';
import { CertificateSummaryBuilder } from '../../certificateSummary';
import { ConfigurationService } from '../configurationService/configurationService';
import { ContractService } from '../contractService/contractsService';
import { IdentityService } from '../identityService/identityService';
import { UtilsService } from '../utilService/utilsService';
import { WalletService } from '../walletService/walletService';
import { SimpleStore } from '../../../libs/simpleStore/simpleStore';
import { IdentitySummary } from '../../../../models/arianee-identity';
import { CertificateContentContainer } from '../../certificateSummary/certificateSummary';
import { StoreNamespace } from '../../../../models/storeNamespace';

@injectable()
export class CertificateDetails {
  constructor (
    private identityService: IdentityService,
    private httpClient: ArianeeHttpClient,
    private contractService: ContractService,
    private configurationService: ConfigurationService,
    private walletService: WalletService,
    private utils: UtilsService,
    private store: SimpleStore
  ) {

  }

  public getCertificateIssuer = async (certificateId: CertificateId) => {
    return this.store.get<IdentitySummary>(StoreNamespace.certificateIssuer, certificateId, () => this.fetchCertificateIssuer(certificateId));
  }

  public fetchCertificateIssuer = async (certificateId: CertificateId) => {
    const issuer = await this.contractService.smartAssetContract.methods
      .issuerOf(certificateId.toString())
      .call();

    return this.identityService.getIdentity(issuer);
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
    certificateURI,
    certificateId,
    proof
  ) => {
    const issuer = await this.contractService.smartAssetContract.methods
      .issuerOf(certificateId)
      .call();
    const identity = await this.identityService.getIdentity(issuer);

    return this.httpClient.RPCCall(
      identity.data.rpcEndpoint,
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

  private getContent = (certificateURI, certificateId, proof) => {
    return this.getCertificateContentFromRPC(
      certificateURI,
      certificateId,
      proof
    ).catch(err => this.getCertificateContentFromHttp(certificateURI));
  }

  public getCertificateContent = (
    certificateId: CertificateId,
    passphrase?
  ) => {
    return this.store.get<CertificateContentContainer>(StoreNamespace.certificateContent, certificateId, () => this.fetchCertificateContent(certificateId, passphrase));
  }

  private fetchCertificateContent = async (
    certificateId: CertificateId,
    passphrase?
  ) => {
    const tokenURI = await this.contractService.smartAssetContract.methods
      .tokenURI(certificateId.toString())
      .call();

    let proof;

    if (passphrase) {
      const temporaryWallet = this.configurationService.walletFactory()
        .fromPassPhrase(passphrase);
      proof = this.utils.signProof(
        JSON.stringify({
          certificateId: certificateId,
          timestamp: new Date()
        }),
        temporaryWallet.privateKey
      );
    } else {
      proof = this.utils.signProof(
        JSON.stringify({
          certificateId: certificateId,
          timestamp: new Date()
        }),
        this.walletService.privateKey
      );
    }

    const certificateContentData: any = await this.getContent(
      tokenURI,
      certificateId,
      proof
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

    return Promise.resolve({ data: certificateContentData, isAuthentic: isCertificateContentValid });
  }
}
