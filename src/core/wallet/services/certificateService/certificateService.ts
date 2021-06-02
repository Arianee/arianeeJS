import { TransactionObject } from '@arianee/arianee-abi/types/types';
import { get } from 'lodash';
import { injectable } from 'tsyringe';
import { ArianeeTokenId } from '../../../../models/ArianeeTokenId';
import { EventContent } from '../../../../models/blockchainEvent';
import { IOwnerOf } from '../../../../models/IOwnerOf';
import { StoreNamespace } from '../../../../models/storeNamespace';
import { hydrateTokenParameters } from '../../../../models/transaction-parameters';
import { ArianeeHttpClient } from '../../../libs/arianeeHttpClient/arianeeHttpClient';
import { isSchemai18n } from '../../../libs/certificateVersion';
import { replaceLanguage } from '../../../libs/i18nSchemaLanguageManager/i18nSchemaLanguageManager';
import { isNullOrUndefined } from '../../../libs/isNullOrUndefined';
import { SimpleStore } from '../../../libs/simpleStore/simpleStore';
import { CertificateSummaryBuilder } from '../../certificateSummary';
import { CertificateSummary, ConsolidatedCertificateRequest } from '../../certificateSummary/certificateSummary';
import { ArianeeAccessTokenService } from '../ArianeeAccessToken/ArianeeAccessTokenService';
import { BatchService } from '../batchService/batchService';
import { CertificateAuthorizationService } from '../certificateAuthorizationService/certificateAuthorizationService';
import { CertificateDetails } from '../certificateDetailsService/certificatesDetailsService';
import { CertificateUtilsService } from '../certificateUtilsService/certificateUtilsService';
import { ConfigurationService } from '../configurationService/configurationService';
import { ContractService } from '../contractService/contractsService';
import { DiagnosisService } from '../diagnosisService/diagnosisService';
import { EventService } from '../eventService/eventsService';
import { GlobalConfigurationService } from '../globalConfigurationService/globalConfigurationService';
import { UtilsService } from '../utilService/utilsService';
import { WalletService } from '../walletService/walletService';
import { Web3Service } from '../web3Service/web3Service';
import { ArianeeAuthentificationService } from '../arianeeAuthentificationService/arianeeAuthentificationService';

@injectable()
export class CertificateService {
  public isCertificateOwnershipRequestable = this.certificateUtilsService.isCertificateOwnershipRequestable;

  public reserveCertificateId = async (certificateId?: number, receiver?: string) => {
    if (certificateId) {
      const certificateIdIsAvailable = await this.isCertificateIdFree(certificateId);
      if (!certificateIdIsAvailable) {
        throw new Error(`Certificate id (${certificateId}) is not available`);
      }
    } else {
      certificateId = await this.getAvailableCertificateId();
    }

    const targetAddress = receiver || this.walletService.address;
    const transcationObject = this.contractService
      .storeContract
      .methods
      .reserveToken(
        certificateId,
        targetAddress);

    try {
      var result = await transcationObject.send()
        .then(i => ({
          ...(<any>i),
          certificateId
        }));

      return result;
    } catch (e) {
      const diagnosis = await this.diagnosisService.diagnosis([
        this.diagnosisService.isStoreApprove(),
        this.diagnosisService.isPOACredit(),
        this.diagnosisService.isCertificateCredit()
      ], e);
      return Promise.reject(diagnosis);
    }
  }

  private getAvailableCertificateId = async ():Promise<number> => {
    const certificateId = this.utils.createUID();

    const isFree = await this.isCertificateIdFree(certificateId);

    if (isFree) {
      return certificateId;
    } else {
      return this.getAvailableCertificateId();
    }
  }

  private isCertificateIdFree = async (certificateId:number):Promise<boolean> => {
    try {
      await this.contractService.smartAssetContract.methods.ownerOf(certificateId).call();
      return false;
    } catch {
      return true;
    }
  }

  constructor (
      private utils: UtilsService,
      private httpClient: ArianeeHttpClient,
      private configurationService: ConfigurationService,
      private contractService: ContractService,
      private certificateDetails: CertificateDetails,
      private walletService: WalletService,
      private eventService: EventService,
      private web3Service: Web3Service,
      private certificateAuthorizationService:CertificateAuthorizationService,
      private globalConfiguration: GlobalConfigurationService,
      private store:SimpleStore,
      private batchService:BatchService,
      private diagnosisService:DiagnosisService,
      private jwtProofService: ArianeeAccessTokenService,
      private certificateUtilsService: CertificateUtilsService,
      private arianeeAuthentificationService:ArianeeAuthentificationService
  ) {
  }

  private hydrateTokenTransaction = (data:hydrateTokenParameters):TransactionObject<any> => {
    const {
      uri,
      hash,
      certificateId,
      encryptedInitialKey,
      tokenRecoveryTimestamp,
      sameRequestOwnershipPassphrase
    } = data;

    return this.contractService.storeContract.methods
      .hydrateToken(
        certificateId,
        hash,
        uri,
        encryptedInitialKey,
        tokenRecoveryTimestamp,
        sameRequestOwnershipPassphrase,
        this.configurationService.arianeeConfiguration.brandDataHubReward.address
      );
  }

  public createAndStoreCertificate=async (data:hydrateTokenParameters, urlOfRPCServer?:string): Promise<{
  [key:string]:any;
  passphrase:string;
  certificateId: ArianeeTokenId;
  deepLink:string
}> => {
    const result = await this.customHydrateToken(data);
    await this.storeContentInRPCServer(result.certificateId, data.content, urlOfRPCServer);
    return result;
  }

  public customHydrateToken = async (data: hydrateTokenParameters): Promise<{
    [key:string]:any;
    passphrase:string;
    certificateId: ArianeeTokenId;
    deepLink:string
  }> => {
    data.uri = data.uri || '';
    const preparedData = data;
    try {
      const preparedData = await this.prepareHydrateToken(data);
      const transcationObject = this.hydrateTokenTransaction(preparedData);

      const result = await transcationObject.send()
        .then(i => ({
          ...(<any>i),
          passphrase: preparedData.passphrase,
          certificateId: preparedData.certificateId,
          deepLink: this.utils.createLink(preparedData.certificateId, preparedData.passphrase)
        }));

      return result;
    } catch (e) {
      const diagnosis = await this.diagnosisService.diagnosis([
        this.diagnosisService.isStoreApprove(),
        this.diagnosisService.isPOACredit(),
        this.diagnosisService.isCertificateCredit(),
        this.diagnosisService.isCertificateIdExist(preparedData.certificateId)
      ], e);
      return Promise.reject(diagnosis);
    }
  }

  /**
   * Update certificate imprint of a certificate
   * @param {{certificateId: ArianeeTokenId; content?: any; imprint?: string}} parameters
   * @returns {Promise<never>}
   */
  public updateCertificate = async <T = any>(parameters: {
    certificateId: ArianeeTokenId,
    content?: any,
    imprint?: string
  }) => {
    const { certificateId, content, imprint } = parameters;

    const contentImprint: string = imprint || await this.utils.calculateImprint(content);
    let result;
    try {
      result = await this.contractService.storeContract.methods
        .updateSmartAsset(
          certificateId,
          contentImprint,
          this.configurationService.arianeeConfiguration.brandDataHubReward.address)
        .send();
    } catch (e) {
      const diagnosis = await this.diagnosisService.diagnosis([
        this.diagnosisService.isStoreApprove(),
        this.diagnosisService.isPOACredit(),
        this.diagnosisService.isUpdateCertificateCredit()
      ], e);
      return Promise.reject(diagnosis);
    }

    return result;
  };

  /**
   * Update imprint and content of certificate
   * @param {{certificateId: ArianeeTokenId; content: any}} parameters
   * @param {string} urlOfRPCServer
   * @returns {Promise<never>}
   */
  public updateAndStoreCertificateContent = async <T = any>(parameters: { certificateId: ArianeeTokenId, content: any }, urlOfRPCServer?: string) => {
    const { content, certificateId } = parameters;

    const result = await this.updateCertificate({
      certificateId,
      content
    });

    await this.storeUpdateContentInRPCServer(certificateId, content, urlOfRPCServer);

    return result;
  };

  /**
   * Store update content of a certificate to Arianee Privacy Gateway
   * @param {ArianeeTokenId} certificateId
   * @param content
   * @param {string} arianeePrivacyGatewayURL
   * @returns {Promise<{jsonrpc: number; id: string; result?: any}>}
   */
  public storeUpdateContentInRPCServer = async (certificateId: ArianeeTokenId, content, arianeePrivacyGatewayURL?: string) => {
    arianeePrivacyGatewayURL = arianeePrivacyGatewayURL || this.configurationService.arianeeConfiguration.defaultArianeePrivacyGateway;
    if (!arianeePrivacyGatewayURL) {
      throw new Error('You need to specify an Arianee Privacy Gateway URL');
    }

    return this.httpClient.RPCCall(arianeePrivacyGatewayURL, 'update.create', {
      certificateId: certificateId,
      json: content
    });
  };

  public customHydrateTokenBatch = async (datas:hydrateTokenParameters[]) => {
    datas.forEach(async (data) => {
      if (data) {
        const preparedData = await this.prepareHydrateToken(data);
        const transactionObject = await this.hydrateTokenTransaction(preparedData);
        this.batchService.addToBatch(transactionObject);
      }
    });

    return this.batchService.executeBatch();
  }

  public storeContentInRPCServer =async (certificateId:ArianeeTokenId, content, arianeePrivacyGatewayURL?:string) => {
    arianeePrivacyGatewayURL = arianeePrivacyGatewayURL || this.configurationService.arianeeConfiguration.defaultArianeePrivacyGateway;
    if (!arianeePrivacyGatewayURL) {
      throw new Error('You need to specify an Arianee Privacy Gateway URL');
    }

    return this.httpClient.RPCCall(arianeePrivacyGatewayURL, 'certificate.create', { certificateId: certificateId, json: content });
  }

  public customRequestToken = async (
    certificateId: number,
    passphrase: string
  ) => {
    const requestTokenPromise = await this.certificateUtilsService.customRequestTokenFactory(certificateId, passphrase);
    return requestTokenPromise.send();
  }

  /**
   * Get certificate from Arianee Access Token
   * example: getCertificateFromArianeeAccessToken(eyJ0eXAiOiJK...restOfYourJWT)
   * @param Arianee Access Token
   * @param query
   */
  public getCertificateFromArianeeAccessToken = (arianeeAccessToken: string, query?: ConsolidatedCertificateRequest) => {
    const { payload: { subId } } = this.jwtProofService.decodeArianeeAccessToken(arianeeAccessToken);

    const queryWithJWT = {
      ...query
    };
    queryWithJWT.advanced = {
      ...queryWithJWT.advanced,
      arianeeProofToken: arianeeAccessToken
    };

    return this.getCertificate(subId, undefined, queryWithJWT);
  };

  /**
   * Get certificate from certificateId and passphrase.
   * @param certificateId
   * @param passphrase
   * @param query
   */
  public getCertificate = async <CertificateType=any, IdentityType=any>(
    certificateId: ArianeeTokenId,
    passphrase?: string,
    query?: ConsolidatedCertificateRequest
  ): Promise<CertificateSummary<CertificateType, IdentityType>> => {
    query = this.globalConfiguration.getMergedQuery(query);
    const response = new CertificateSummaryBuilder();
    response.setCertificateId(certificateId);
    const requestQueue = [];

    if (query.content) {
      const contentDetails = this.certificateDetails.getCertificateContent(
        {
          certificateId,
          passphrase,
          query
        }
      ).then((certificateContent) => {
        response.setContent(certificateContent);
      });

      requestQueue.push(
        contentDetails
      );
    }

    if (query.owner) {
      requestQueue.push(
        this.certificateDetails.getCertificateOwner(certificateId)
          .then(owner => {
            return response.setOwner(owner, this.walletService.address);
          }));
    }

    if (query.issuer) {
      const issuerDetails = this.certificateDetails.getCertificateIssuer({
        certificateId,
        query
      })
        .then(identityDetails => {
          response.setIssuer(
            identityDetails.isAuthentic,
            identityDetails.isApproved,
            identityDetails.imprint,
            identityDetails
          );
        });
      requestQueue.push(issuerDetails);
    }

    if (query.messageSenders) {
      const messageSenders = this.certificateAuthorizationService.getMessageSenders({ certificateId, query })
        .then(messageSenders => response.setMessageSenders(messageSenders));

      requestQueue.push(messageSenders);
    }

    if (query.isRequestable) {
      const isRequestable = this.isCertificateOwnershipRequestable(certificateId, passphrase).then(
        isRequestable => response.setIsRequestable(isRequestable.isTrue)
      );
      requestQueue.push(isRequestable);
    }

    if (query.events) {
      const eventsDetails = this.eventService.getCertificateTransferEvents({ certificateId, query }).then(events => {
        response.setEvents(events);
      });
      requestQueue.push(eventsDetails);
    }

    if (query.arianeeEvents) {
      const arianeeEvents = this.eventService.getCertificateArianeeEvents<EventContent, IdentityType>({
        certificateId, passphrase, query
      }).then(events => {
        response.setArianeeEvents(events);
      });
      requestQueue.push(arianeeEvents);
    }

    if (query.recover) {
      const recoverCertificate = async () => {
        const result = await this.contractService.smartAssetContract.methods.tokenRecoveryDate(certificateId).call();
        const isRecoverable = Date.now() / 1000 < +result;
        response.setRecover({
          isRecoverable,
          timestamp: +result * 1000
        });
      };

      requestQueue.push(recoverCertificate());
    }

    try {
      await Promise.all(requestQueue);
    } catch (err) {
      console.error(err);
    }

    const summary = response.build();

    return summary;
  }

  /**
   * Get all certificate ids owned by this wallet
   */
  public getMyCertificateIds =async ():Promise<ArianeeTokenId[]> => {
    const numberOfCertificates = await this.contractService.smartAssetContract.methods
      .balanceOf(this.walletService.address)
      .call();

    const rangeOfIndex = [];

    for (let i = 0; i < <any>numberOfCertificates; i++) {
      rangeOfIndex.push(i);
    }

    // Fetch certificateIds of certificate with index
    return Promise.all(
      rangeOfIndex.map(index =>
        this.contractService.smartAssetContract.methods
          .tokenOfOwnerByIndex(this.walletService.address, index)
          .call()
      )
    );
  }

  public getMyCertificates = async (
    query?: ConsolidatedCertificateRequest,
    verifyOwnership?:boolean
  ): Promise<CertificateSummary[]> => {
    // Fetch number of certificates this user owns
    const certificateIds = await this.store.get<ArianeeTokenId[]>(StoreNamespace.certificateIds, this.walletService.address, () => this.getMyCertificateIds(), verifyOwnership);

    // Fetch details of each certificate
    const results = await Promise.all(
      certificateIds.map(certificateId =>
        this.getCertificate(certificateId, undefined, query)
      )
    );

    return results.reverse();
  }

  public getMyCertificatesGroupByIssuer = async (query?: ConsolidatedCertificateRequest)
    : Promise<{ [key: string]: CertificateSummary[] }> => {
    const certificates = await this.getMyCertificates(query);

    const groupByIssuerCertificates = certificates
      .reduce<{ [key: string]: CertificateSummary[] }>((accumulator, currentValue) => {
        const issuerAddress = currentValue.issuer.identity.address;
        if (!Object.prototype.hasOwnProperty.call(accumulator, issuerAddress)) {
          accumulator[issuerAddress] = [];
        }
        accumulator[issuerAddress].push(currentValue);

        return accumulator;
      }, {});

    return groupByIssuerCertificates;
  }

  public createCertificateRequestOwnershipLink = async (
    certificateId: number,
    passphrase?: string
  ) => {
    if (!passphrase) {
      passphrase = this.utils.createPassphrase();
    }
    await this.setPassphrase(certificateId, passphrase, 1);

    return this.utils.createLink(certificateId, passphrase);
  }

  private async setPassphrase (
    certificateId: number,
    passphrase: string,
    type: number
  ) {
    const temporaryWallet = this.configurationService
      .walletFactory()
      .fromPassPhrase(passphrase);

    return this.contractService.smartAssetContract.methods
      .addTokenAccess(certificateId, temporaryWallet.address, true, type)
      .send();
  }

  // Ajouter une passphrase à un token
  //  this.smartAssetContract.methods.addTokenAccess()
  /**
   *
   * @param arianeeLink can be both "https://arianee.net/4567,fgheziufez" or a Arianee Access Token
   * @param query
   */
  public getCertificateFromLink = (arianeeLink: string, query?: ConsolidatedCertificateRequest) => {
    const { certificateId, authentification } = this.arianeeAuthentificationService.extractParametersFromArianeeLink(arianeeLink);

    return this.getCertificate(certificateId, authentification, query);
  }

  private prepareHydrateToken = async (data: hydrateTokenParameters):Promise<hydrateTokenParameters> => {
    let {
      uri,
      hash,
      certificateId,
      passphrase,
      tokenRecoveryTimestamp,
      sameRequestOwnershipPassphrase,
      content
    } = data;

    if (certificateId) {
      const certificateIdIsAvailable = await this.certificateUtilsService.canCreateCertificateWithCertificateId(certificateId);

      if (!certificateIdIsAvailable) {
        throw new Error(`Certificate id (${certificateId}) is not available`);
      }
    } else {
      certificateId = await this.getAvailableCertificateId();
    }

    const fiveYears = 60 * 60 * 24 * 365 * 5;
    const now = new Date();

    tokenRecoveryTimestamp =
      tokenRecoveryTimestamp ||
      Math.round(now.setDate(now.getDate()) / 1000) + fiveYears;

    sameRequestOwnershipPassphrase =
      sameRequestOwnershipPassphrase !== undefined
        ? sameRequestOwnershipPassphrase
        : true;

    passphrase = passphrase || this.utils.createPassphrase();

    const temporaryWallet = this.configurationService
      .walletFactory()
      .fromPassPhrase(passphrase);

    console.assert(
      !(hash && content),
      'you should choose between hash and certificate'
    );
    console.assert(
      !(isNullOrUndefined(hash) && isNullOrUndefined(content)),
      'you should pass at least on parameter'
    );

    if (content) {
      hash = await this.utils.calculateImprint(content);
    }

    return {
      uri,
      hash,
      certificateId,
      encryptedInitialKey: temporaryWallet.address,
      passphrase,
      tokenRecoveryTimestamp,
      sameRequestOwnershipPassphrase,
      content
    };
  };

  /**
   * Get information about owner compared to this wallet.
   * It does not throw if certificateId does not exist
   * @param {ArianeeTokenId} certificateId
   * @returns {Promise<IOwnerOf>}
   */
  public ownerOf = async (certificateId: ArianeeTokenId): Promise<IOwnerOf> => {
    let address;
    try {
      address = await this.contractService
        .smartAssetContract
        .methods
        .ownerOf(certificateId)
        .call();
    } catch (e) {
      address = undefined;
    }

    return {
      address,
      hasOwner: address !== undefined,
      isOwner: address === this.walletService.address
    };
  };

  /**
   * Transfer a certificate from this wallet to another wallet
   * @param {ArianeeTokenId} certificateId
   * @param {string} toAddress
   * @returns {Promise<void>}
   */
  public transfer = async (certificateId: ArianeeTokenId, toAddress: string) => {
    const { isOwner } = await this.ownerOf(certificateId);

    if (!isOwner) {
      throw new Error(`This wallet is not the owner of ${certificateId}`);
    } else {
      return this.contractService
        .smartAssetContract
        .methods
        .safeTransferFrom(
          this.walletService.address,
          toAddress,
          certificateId
        ).send();
    }
  };

  /**
   * Transfer certificate to dead address if this wallet is owner
   * @param {ArianeeTokenId} certificateId
   * @returns {Promise<any>}
   */
  public destroyCertificate =(certificateId:ArianeeTokenId):Promise<any> => {
    return this.transfer(certificateId, '0x000000000000000000000000000000000000dead');
  }

  public recoverCertificate =(certificateId:ArianeeTokenId):Promise<any> => {
    return this.contractService.smartAssetContract.methods
      .recoverTokenToIssuer(certificateId)
      .send();
  }
}
