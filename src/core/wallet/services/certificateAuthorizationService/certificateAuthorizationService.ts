import { injectable } from 'tsyringe';
import { ArianeeTokenId } from '../../../../models/ArianeeTokenId';
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
  public getMessageSenders= async (parameters:{certificateId:ArianeeTokenId, query:ConsolidatedCertificateRequest}):Promise<{[key:string]:boolean}> => {
    const { address } = await this.certificateDetailsService.fetchCertificateIssuer(parameters);
    const { certificateId } = parameters;

    const currentAddress = this.walletService.address;
    const isIssuerAuthorized = await this.contractService.whitelistContract.methods
      .isAuthorized(certificateId, address, currentAddress)
      .call();

    return {
      [address]: isIssuerAuthorized
    };
  }

    public setMessageAuthorizationFor= async (certificateId:ArianeeTokenId, senderAddress:string, isAuthorized:boolean):Promise<any> => {
      return this.contractService.whitelistContract.methods.addBlacklistedAddress(senderAddress, certificateId, !isAuthorized).send();
    }
}
