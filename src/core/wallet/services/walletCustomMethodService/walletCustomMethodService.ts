import { injectable, singleton } from 'tsyringe';
import { creditTypeEnum } from '../../../../models/creditTypesEnum';
import { ArianeeHttpClient } from '../../../libs/arianeeHttpClient/arianeeHttpClient';
import { BalanceService } from '../balanceService/balanceService';
import { CertificateAuthorizationService } from '../certificateAuthorizationService/certificateAuthorizationService';
import { CertificateService } from '../certificateService/certificateService';
import { ConfigurationService } from '../configurationService/configurationService';
import { ContractService } from '../contractService/contractsService';
import { DiagnosisService } from '../diagnosisService/diagnosisService';
import { EventService } from '../eventService/eventsService';
import { IdentityService } from '../identityService/identityService';
import { POAAndAriaService } from '../POAAndAriaFaucet/POAAndAriaService';
import { WalletService } from '../walletService/walletService';
import { Web3Service } from '../web3Service/web3Service';

@injectable()
export class WalletCustomMethodService {
  constructor (private httpClient: ArianeeHttpClient,
              private configurationService: ConfigurationService,
              private web3Service: Web3Service,
              private contractService: ContractService,
              private eventService: EventService,
              private walletService: WalletService,
              private certificateService: CertificateService,
               private poaAndAriaService:POAAndAriaService,
               private identityService:IdentityService,
               private certificateAuthorizationService:CertificateAuthorizationService,
               private balanceService:BalanceService,
               private diagnosisService:DiagnosisService
  ) {

  }

  public getMethods () {
    return {
      requestAria: this.poaAndAriaService.requestAria,
      requestPoa: this.poaAndAriaService.requestPoa,

      createCertificate: this.certificateService.customHydrateToken,
      createCertificatesBatch: this.certificateService.customHydrateTokenBatch,
      createAndStoreCertificate: this.certificateService.createAndStoreCertificate,

      getCertificate: this.certificateService.getCertificate,
      destroyCertificate: this.certificateService.destroyCertificate,
      recoverCertificate: this.certificateService.recoverCertificate,
      getMyCertificates: this.certificateService.getMyCertificates,
      getMyCertificatesGroupByIssuer: this.certificateService.getMyCertificatesGroupByIssuer,
      getIdentity: this.identityService.getSimpleIdentity,
      getIdentityByShortId: this.identityService.getIdentityByShortId,
      createCertificateRequestOwnershipLink: this.certificateService
        .createCertificateRequestOwnershipLink,
      createCertificateProofLink: this.certificateService.createCertificateProofLink,
      createActionProofLink: this.certificateService.createActionProofLink,

      getCertificateFromLink: this.certificateService.getCertificateFromLink,

      isCertificateProofValid: this.certificateService.isCertificateProofValid,

      isCertificateOwnershipRequestable: this.certificateService.isCertificateOwnershipRequestable,
      requestCertificateOwnership: this.certificateService.customRequestToken,
      balanceOfAria: this.balanceService.balanceOfAria,
      balanceOfPoa: this.balanceService.balanceOfPoa,

      approveStore: this.approveStore,
      buyCredits: this.buyCredits,
      balanceOfCredit: this.balanceService.balanceOfCredit,

      acceptArianeeEvent: this.eventService.acceptArianeeEvent,
      refuseArianeeEvent: this.eventService.refuseArianeeEvent,
      setMessageAuthorizationFor: this.certificateAuthorizationService.setMessageAuthorizationFor,
      getMessageSenders: this.certificateAuthorizationService.getMessageSenders,
      storeContentInRPCServer: this.certificateService.storeContentInRPCServer,
      createArianeeEvent: this.eventService.createArianeeEvent,
      storeArianeeEvent: this.eventService.storeArianeeEventContentInRPCServer,
      createAndStoreArianeeEvent: this.eventService.createAndStoreArianeeEvent,
      diagnosis: this.diagnosisService.diagnosis
    };
  }

  private approveStore = () => {
    return this.contractService.ariaContract.methods
      .approve(
        this.configurationService.arianeeConfiguration.store.address,
        '10000000000000000000000000000'
      )
      .send();
  }

  public buyCredits = async (creditType: string, quantity: number, receiver?: string) => {
    if (!Object.prototype.hasOwnProperty.call(creditTypeEnum, creditType)) {
      throw new Error('this credit type does not exist !!! ' + creditType);
    }

    receiver = receiver || this.walletService.address;

    try {
      var result = await this.contractService.storeContract.methods
        .buyCredit(creditTypeEnum[creditType], quantity, receiver)
        .send();

      return result;
    } catch (e) {
      const diagnosis = await this.diagnosisService.diagnosis([
        this.diagnosisService.isStoreApprove(),
        this.diagnosisService.isAriaCredit()
      ], e);
      return Promise.reject(diagnosis);
    }
  }
}
