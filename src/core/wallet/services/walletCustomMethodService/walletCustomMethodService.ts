import { injectable } from 'tsyringe';
import { ArianeeTokenId } from '../../../../models/ArianeeTokenId';
import { creditNameToType, creditTypeEnum } from '../../../../models/creditTypesEnum';
import { hydrateTokenParameters } from '../../../../models/transaction-parameters';
import { ArianeeHttpClient } from '../../../libs/arianeeHttpClient/arianeeHttpClient';
import { ConsolidatedCertificateRequest, ConsolidatedIssuerRequest } from '../../certificateSummary/certificateSummary';
import { BalanceService } from '../balanceService/balanceService';
import { BlockchainUtilsService } from '../blockChainUtilsService/blockchainUtilsService';
import { CertificateAuthorizationService } from '../certificateAuthorizationService/certificateAuthorizationService';
import { CertificateProofService } from '../certificateProofService/certificateProofService';
import { CertificateService } from '../certificateService/certificateService';
import { ConfigurationService } from '../configurationService/configurationService';
import { ContractService } from '../contractService/contractsService';
import { DiagnosisService } from '../diagnosisService/diagnosisService';
import { EventService } from '../eventService/eventsService';
import { IdentityService } from '../identityService/identityService';
import { ArianeeAccessTokenService } from '../ArianeeAccessToken/ArianeeAccessTokenService';
import { MessageService } from '../messageService/messageService';
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
              private messageService: MessageService,
              private walletService: WalletService,
              private certificateService: CertificateService,
               private poaAndAriaService:POAAndAriaService,
               private identityService:IdentityService,
               private certificateAuthorizationService:CertificateAuthorizationService,
               private balanceService:BalanceService,
               private diagnosisService:DiagnosisService,
               private arianeeAccessTokenService:ArianeeAccessTokenService,
               private certificateProofService:CertificateProofService,
               private blockchainUtilsService:BlockchainUtilsService
  ) {

  }

  public arianeeMethods () {
    // eslint-disable-next-line no-console
    console.info('arianee Methods is a beta feature. It will evolve in future');

    return {
      aria: {
        faucet: this.poaAndAriaService.requestAria,
        balance: (objParams: { address }) => this.balanceService.balanceOfAria(objParams.address)
      },
      poa: {
        balance: this.poaAndAriaService.requestPoa,
        faucet: (objParams: { address }) => this.balanceService.balanceOfPoa(objParams.address)
      },
      credit: {
        buy: (objParams: { creditType: string, quantity: number, receiver?: string }) =>
          this.buyCredits(objParams.creditType, objParams.quantity, objParams.receiver),
        balance: (objParams: { creditType: string, address?: string }) =>
          this.balanceService.balanceOfCredit(objParams.creditType, objParams.address),
        types: this.getCreditTypes
      },
      identity: {
        fetch: (objParams: { address: string, query?: ConsolidatedIssuerRequest }) =>
          this.identityService.getSimpleIdentity(objParams.address, objParams.query),
        // ICI
        getByShortId: (objParams: { shortId: string }) => this.identityService.getIdentityByShortId(objParams.shortId)
      },
      certificate: {
        fetch: {
          one: (objParams: { certificateId: string, passphrase?: string, query?: ConsolidatedCertificateRequest }) =>
            this.certificateService
              .getCertificate(objParams.certificateId, objParams.passphrase, objParams.query),
          oneFromLink: (objParams: { link: string, query: ConsolidatedCertificateRequest }) =>
            this.certificateService.getCertificateFromLink(objParams.link, objParams.query),
          oneFromArianeeAccessToken: (objParams: { arianeeAccessToken: string, query: ConsolidatedCertificateRequest }) =>
            this.certificateService.getCertificateFromArianeeAccessToken(objParams.arianeeAccessToken, objParams.query),
          mine: {
            all: (objParams: { verifyOwnership?: boolean, query?: ConsolidatedCertificateRequest }) =>
              this.certificateService.getMyCertificates(objParams.query, objParams.verifyOwnership),
            groupByIssuer:
                (objParams: { query?: ConsolidatedCertificateRequest }) =>
                  this.certificateService.getMyCertificatesGroupByIssuer(objParams.query)
          }
        },
        creation: {
          create: this.certificateService.customHydrateToken,
          reserveId: (objParams: { certificateId: number }) => this.certificateService.reserveCertificateId(objParams.certificateId),
          createAndStore: (objParams: { data: hydrateTokenParameters, urlOfRPCServer: string }) =>
            this.certificateService.createAndStoreCertificate(objParams.data, objParams.urlOfRPCServer),
          storeContent: (objParams: {
            certificateId: ArianeeTokenId, content, url?: string
          }) => this.certificateService.storeContentInRPCServer(objParams.certificateId, objParams.content, objParams.url),
          batch: (objParams: { datas: hydrateTokenParameters[] }) => this.certificateService.customHydrateTokenBatch(objParams.datas)
        },
        arianeeAccessToken: {
          create: (objParams:{url:string, certificateId: number}) =>
            this.arianeeAccessTokenService.createActionArianeeAccessTokenLink(objParams.url, objParams.certificateId),
          decode: (objParams:{arianeeAccessToken}) =>
            this.arianeeAccessTokenService.decodeArianeeAccessToken(objParams.arianeeAccessToken),
          isArianeeAccessTokenValid: (objParams:{arianeeAccessToken}) =>
            this.arianeeAccessTokenService.isCertificateArianeeAccessTokenValid(objParams.arianeeAccessToken),
          isCertificateProofValid: (objParams:{
            certificateId: number,
            passphrase?: string,
            arianeeAccessToken?:string
          }) => this.certificateProofService.isCertificateProofValid(objParams.certificateId, objParams.passphrase, objParams.arianeeAccessToken),
          isCertificateProofValidFromLink: (objParams:{proofLink:string}) =>
            this.certificateProofService.isCertificateProofValidFromLink(objParams.proofLink),
          isCertificateProofValidFromActionProofLink: (objParams:{actionProofLink:string}) =>
            this.certificateProofService.isAuthURL(objParams.actionProofLink)
        },
        proof: {
          createCertificateProofLink: (objParams:{certificateId: number, passphrase?: string}) =>
            this.certificateProofService.createCertificateProofLink(objParams.certificateId, objParams.passphrase),
          createActionProofLink: (objParams:{url:string, certificateId: number, passphrase?: string}) =>
            this.certificateProofService.createActionProofLink(objParams.url, objParams.certificateId, objParams.passphrase),
          isCertificateProofValid: (objParams:{
            certificateId: number,
            passphrase?: string,
            arianeeAccessToken?:string
          }) => this.certificateProofService.isCertificateProofValid(objParams.certificateId, objParams.passphrase, objParams.arianeeAccessToken),
          isCertificateProofValidFromLink: (objParams:{proofLink:string}) =>
            this.certificateProofService.isCertificateProofValidFromLink(objParams.proofLink),
          isCertificateProofValidFromActionProofLink: (objParams:{actionProofLink:string}) =>
            this.certificateProofService.isAuthURL(objParams.actionProofLink)
        },
        ownership: {
          destroy: (objParams:{certificateId:ArianeeTokenId}) =>
            this.certificateService.destroyCertificate(objParams.certificateId),
          recover: (objParams:{certificateId:ArianeeTokenId}) =>
            this.certificateService.recoverCertificate(objParams.certificateId),
          request: (objParams:{certificateId:ArianeeTokenId, passphrase:string}) =>
            this.certificateService.customRequestToken(objParams.certificateId, objParams.passphrase),
          isRequestable: (objParams:{certificateId:ArianeeTokenId, passphrase:string}) =>
            this.certificateService.isCertificateOwnershipRequestable(objParams.certificateId, objParams.passphrase),
          createRequestLink: (objParams:{certificateId:ArianeeTokenId, passphrase:string}) =>
            this.certificateService.createCertificateRequestOwnershipLink(objParams.certificateId, objParams.passphrase)
        }
      },
      arianeeEvent: {
        accept: (objParams: { eventId: string }) => this.eventService.acceptArianeeEvent(objParams.eventId),
        refuse: (objParams: { eventId: string }) => this.eventService.refuseArianeeEvent(objParams.eventId),
        setMessageAuthorization: (objParams:{
          certificateId:ArianeeTokenId, senderAddress:string, isAuthorized:boolean
        }) => this.certificateAuthorizationService
          .setMessageAuthorizationFor(objParams.certificateId, objParams.senderAddress, objParams.isAuthorized),
        senders: this.certificateAuthorizationService.getMessageSenders,
        creation: {
          create: this.eventService.createArianeeEvent,
          storeContent: (objParams:{
            certificateId:ArianeeTokenId,
            arianeeEventId:number,
            content,
            url:string
          }) => this.eventService
            .storeArianeeEventContentInRPCServer(objParams.certificateId, objParams.arianeeEventId, objParams.content, objParams.url),
          createAndStore: (objParams:{
              data: {
                uri?: string;
                certificateId: number,
                arianeeEventId?:number;
                content?: { $schema: string;[key: string]: any };
              }, urlOfRPC:string
          }
          ) => this.eventService.createAndStoreArianeeEvent(objParams.data, objParams.urlOfRPC)
        }
      },
      store: {
        approve: this.approveStore
      },
      advanced: {
        diagnosis: this.diagnosisService.diagnosis
      },
      dMessage: {
        fetch: {
          mine: this.messageService.getMyMessages,
          one: this.messageService.getMessage
        },
        creation: {
          send: (objParams:{
            data: {
              uri?: string;
              certificateId: number,
              content?: { $schema: string;[key: string]: any };
              messageId?: number;
            }, url:string
          }) => this.messageService.createAndStoreMessage(objParams.data, objParams.url),
          storeContent: (objParams:{
            messageId:number,
            content,
            url:string
          }) => this.messageService.storeMessageContentInRPCServer(objParams.messageId, objParams.messageId, objParams.url),
          create: this.messageService.createMessage,
          createAndStore: (objParams:{
            data: {
              uri?: string;
              certificateId: number,
              content?: { $schema: string;[key: string]: any };
              messageId?: number;
            }, url:string
          }) => this.messageService.createAndStoreMessage(objParams.data, objParams.url)
        },
        markAsRead: (objParams:{certificateId:ArianeeTokenId}) => this.messageService.markAsRead(objParams.certificateId)
      }
    };
  }

  public getMethods () {
    return {
      requestAria: this.poaAndAriaService.requestAria,
      requestPoa: this.poaAndAriaService.requestPoa,
      cancelTransactions: this.blockchainUtilsService.cancelTransactions,

      reserveCertificateId: this.certificateService.reserveCertificateId,
      createCertificate: this.certificateService.customHydrateToken,
      createCertificatesBatch: this.certificateService.customHydrateTokenBatch,
      createAndStoreCertificate: this.certificateService.createAndStoreCertificate,

      getCertificate: this.certificateService.getCertificate,
      getCertificateFromArianeeAccessToken: this.certificateService.getCertificateFromArianeeAccessToken,

      destroyCertificate: this.certificateService.destroyCertificate,
      recoverCertificate: this.certificateService.recoverCertificate,
      getMyCertificates: this.certificateService.getMyCertificates,
      getMyCertificatesGroupByIssuer: this.certificateService.getMyCertificatesGroupByIssuer,
      getIdentity: this.identityService.getSimpleIdentity,
      getIdentityByShortId: this.identityService.getIdentityByShortId,
      createCertificateRequestOwnershipLink: this.certificateService
        .createCertificateRequestOwnershipLink,
      createCertificateProofLink: this.certificateProofService.createCertificateProofLink,
      createActionProofLink: this.certificateProofService.createActionProofLink,

      getCertificateFromLink: this.certificateService.getCertificateFromLink,

      isCertificateProofValid: this.certificateProofService.isCertificateProofValid,
      isCertificateProofValidFromLink: this.certificateProofService.isCertificateProofValidFromLink,
      isCertificateProofValidFromActionProofLink: this.certificateProofService.isAuthURL,

      isCertificateOwnershipRequestable: this.certificateService.isCertificateOwnershipRequestable,
      requestCertificateOwnership: this.certificateService.customRequestToken,
      balanceOfAria: this.balanceService.balanceOfAria,
      balanceOfRia: this.balanceService.balanceOfRia,
      balanceOfPoa: this.balanceService.balanceOfPoa,
      balanceOfAriaReadable: this.balanceService.balanceOfAriaReadable,
      getCreditPrice: this.balanceService.getCreditPrice,
      approveStore: this.approveStore,
      buyCredits: this.buyCredits,
      balanceOfCredit: this.balanceService.balanceOfCredit,
      ownerOf: this.certificateService.ownerOf,
      transfer: this.certificateService.transfer,
      acceptArianeeEvent: this.eventService.acceptArianeeEvent,
      refuseArianeeEvent: this.eventService.refuseArianeeEvent,
      setMessageAuthorizationFor: this.certificateAuthorizationService.setMessageAuthorizationFor,
      getMessageSenders: this.certificateAuthorizationService.getMessageSenders,
      storeContentInRPCServer: this.certificateService.storeContentInRPCServer,
      createArianeeEvent: this.eventService.createArianeeEvent,
      storeArianeeEvent: this.eventService.storeArianeeEventContentInRPCServer,
      createAndStoreArianeeEvent: this.eventService.createAndStoreArianeeEvent,

      getMyMessages: this.messageService.getMyMessages,
      getMessage: this.messageService.getMessage,

      isMessageRead: this.messageService.isMessageRead,
      createMessage: this.messageService.createMessage,
      storeMessage: this.messageService.storeMessageContentInRPCServer,
      createAndStoreMessage: this.messageService.createAndStoreMessage,

      markAsRead: this.messageService.markAsRead,

      diagnosis: this.diagnosisService.diagnosis,

      createActionArianeeAccessTokenLink: this.arianeeAccessTokenService.createActionArianeeAccessTokenLink,
      decodeArianeeAccessToken: this.arianeeAccessTokenService.decodeArianeeAccessToken,
      createCertificateArianeeAccessToken: this.arianeeAccessTokenService.createCertificateArianeeAccessToken,
      isCertificateArianeeAccessTokenValid: this.arianeeAccessTokenService.isCertificateArianeeAccessTokenValid,

      createAuthURL: this.certificateProofService.createAuthURL,
      isAuthURL: this.certificateProofService.isAuthURL,
      updateAndStoreCertificate: this.certificateService.updateAndStoreCertificateContent,
      storeUpdateContentInRPCServer: this.certificateService.storeUpdateContentInRPCServer,
      updateCertificate: this.certificateService.updateCertificate
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

  public getCreditTypes = () => Object.values(creditTypeEnum);

  public buyCredits = async (creditType: string, quantity: number, receiver?: string) => {
    if (!Object.prototype.hasOwnProperty.call(creditTypeEnum, creditType)) {
      throw new Error('this credit type does not exist !!! ' + creditType);
    }

    receiver = receiver || this.walletService.address;

    try {
      var result = await this.contractService.storeContract.methods
        .buyCredit(creditNameToType[creditType], quantity, receiver)
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
