import { inject, injectable, singleton } from 'tsyringe';
import { CertificateId } from '../../../../models/CertificateId';
import { ArianeeHttpClient } from '../../../libs/arianeeHttpClient/arianeeHttpClient';
import { CertificateSummaryBuilder } from '../../certificateSummary';
import { ArianeeWallet } from '../../wallet';
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
    private utils: UtilsService
  ) {
  }

  public getOwnerFactory = (
    certificateId: CertificateId,
    certificateBuilder?: CertificateSummaryBuilder
  ) => {
    return async () => {
      const owner = await this.contractService.smartAssetContract.methods
        .ownerOf(certificateId.toString())
        .call();

      if (certificateBuilder) certificateBuilder.setOwner(owner, this.walletService.publicKey);

      return owner;
    };
  }

  private getCertificateContentFromHttp = async certificateURI => {
    return this.httpClient.fetchWithCache(
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

  private getCertificateContent = (certificateURI, certificateId, proof) => {
    return this.getCertificateContentFromRPC(
      certificateURI,
      certificateId,
      proof
    ).catch(err => this.getCertificateContentFromHttp(certificateURI));
  }

  public getContentFactory = (
    certificateId: CertificateId,
    passphrase?,
    certificateBuilder?: CertificateSummaryBuilder
  ) => {
    return async () => {
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

      const certificateContentData: any = await this.getCertificateContent(
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

      if (certificateBuilder) {
        certificateBuilder.setContent(
          certificateContentData,
          isCertificateContentValid
        );
      }

      return certificateContentData;
    };
  }
}
