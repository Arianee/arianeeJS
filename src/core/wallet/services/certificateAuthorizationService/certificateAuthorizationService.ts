import { injectable } from 'tsyringe';
import { CertificateId } from '../../../../models/CertificateId';
import { ConsolidatedCertificateRequest } from '../../certificateSummary/certificateSummary';
import { CertificateDetails } from '../certificateDetailsService/certificatesDetailsService';
import { ContractService } from '../contractService/contractsService';
import { IdentityService } from '../identityService/identityService';
import { WalletService } from '../walletService/walletService';

@injectable()
export class CertificateAuthorizationService {
  constructor (private contractService:ContractService,
               private identityService:IdentityService,
               private certificateDetailsService:CertificateDetails,
               private walletService:WalletService) {
  }

  /**
     * Get authorized senders for this certificate.
     * For now it return only the issuer
     * @param certificateId
     */
  public getMessageSenders= async (parameters:{certificateId:CertificateId, query:ConsolidatedCertificateRequest}):Promise<{[key:string]:boolean}> => {
    const { address } = await this.certificateDetailsService.fetchCertificateIssuer(parameters);
    const { certificateId } = parameters;

    const publicKey = this.walletService.publicKey;
    const isIssuerAuthorized = await this.contractService.whitelistContract.methods
      .isAuthorized(certificateId, address, publicKey)
      .call();

    return {
      [address]: isIssuerAuthorized
    };
  }

    public setMessageAuthorizationFor= async (certificateId:CertificateId, senderAddress:string, isAuthorized:boolean):Promise<any> => {
      return this.contractService.whitelistContract.methods.addBlacklistedAddress(senderAddress, certificateId, !isAuthorized).send();
    }
}
