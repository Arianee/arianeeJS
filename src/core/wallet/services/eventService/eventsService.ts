import { get } from 'lodash';
import { injectable } from 'tsyringe';
import { ArianeeTokenId } from '../../../../models/ArianeeTokenId';
import { BlockchainEvent, EventContent } from '../../../../models/blockchainEvent';
import { blockchainEventsName } from '../../../../models/blockchainEventsName';
import { ArianeeHttpClient } from '../../../libs/arianeeHttpClient/arianeeHttpClient';
import { isSchemai18n } from '../../../libs/is18n/certificateVersion';
import { replaceLanguage } from '../../../libs/i18nSchemaLanguageManager/i18nSchemaLanguageManager';
import { isNullOrUndefined } from '../../../libs/isNullOrUndefined/isNullOrUndefined';
import { sortEvents } from '../../../libs/sort/sortEvents';
import {
  ArianeeEvent,
  CertificateContentContainer,
  ConsolidatedCertificateRequest
} from '../../certificateSummary/certificateSummary';
import { ArianeePrivacyGatewayService } from '../arianeePrivacyGatewayService/arianeePrivacyGatewayService';
import { ConfigurationService } from '../configurationService/configurationService';
import { ContractService } from '../contractService/contractsService';
import { DiagnosisService } from '../diagnosisService/diagnosisService';
import { IdentityService } from '../identityService/identityService';
import { UtilsService } from '../utilService/utilsService';
import { WalletService } from '../walletService/walletService';

@injectable()
export class EventService {
  constructor (
      private identityService: IdentityService,
      private contractService: ContractService,
      private walletService: WalletService,
      private configurationService: ConfigurationService,
      private httpClient: ArianeeHttpClient,
      private utils: UtilsService,
      private diagnosisService: DiagnosisService,
      private arianeePrivacyGateWayService: ArianeePrivacyGatewayService
  ) {
  }

  public getCertificateTransferEvents = async (parameters:
      { certificateId: ArianeeTokenId,
          query:ConsolidatedCertificateRequest
      }
  ): Promise<any> => {
    const { certificateId } = parameters;

    const sortedEvents:BlockchainEvent[] = await this.contractService.smartAssetContract
      .getPastEvents('Transfer', {
        filter: { _tokenId: certificateId },
        fromBlock: 0,
        toBlock: 'latest'
      })
      .then(events => events.sort(sortEvents));

    const consolidatedEvent = async (event) => {
      const [timestamp, identity] = await Promise.all([
        this.utils.getTimestampFromBlock(event.blockNumber),
        this.identityService
          .getIdentity({
            ...parameters,
            address: event.returnValues._to
          })
      ]);

      return {
        timestamp,
        identity,
        ...event
      };
    };

    return Promise.all(
      sortedEvents.map(consolidatedEvent)
    );
  }

  public getCertificateArianeeEvents = async <EventType, IdentityType>(
    parameters:{
        certificateId: number,
        passphrase?: string,
        query:ConsolidatedCertificateRequest
      }
  ): Promise<ArianeeEvent<EventType, IdentityType>[]> => {
    const { certificateId, query, passphrase } = parameters;

    const issuer = await this.contractService.smartAssetContract.methods
      .issuerOf(certificateId)
      .call();

    let rpcEndPoint = get(query, 'issuer.rpcURI');
    if (!rpcEndPoint) {
      const issuerIdentity = await this.identityService.getIdentity({ address: issuer, query });
      rpcEndPoint = (issuerIdentity.data && issuerIdentity.data.rpcEndpoint) ? issuerIdentity.data.rpcEndpoint : undefined;
    }
    if (!rpcEndPoint) {
      return [];
    }
    const [validateEvents, pendingEvents] = await Promise.all([
      this.getValidateEvents(certificateId, rpcEndPoint, passphrase),
      this.getPendingEvents(certificateId, rpcEndPoint, passphrase)
    ]);
    const allEvents = [...validateEvents, ...pendingEvents];

    const orderedArianeeEvents = allEvents.sort(EventService.orderArianeeEvents);

    if (get(query, 'advanced.languages')) {
      return orderedArianeeEvents
        .map(arianeeEvent => {
          if (isSchemai18n(arianeeEvent.content.data)) {
            return replaceLanguage(arianeeEvent, query.advanced.languages) as any;
          } else {
            return arianeeEvent;
          }
        });
    } else {
      return orderedArianeeEvents;
    }
  }

  static orderArianeeEvents= (leftEvent:ArianeeEvent, rightEvent:ArianeeEvent) => leftEvent.timestamp - leftEvent.timestamp

  private getValidateEvents = async (certificateId, rpcEndpoint, passphrase?) => {
    const eventLenth = await this.contractService.eventContract.methods.eventsLength(certificateId).call();

    const eventRangeOfIndex = [];
    for (let i = 0; i < <any>eventLenth; i++) {
      eventRangeOfIndex.push(i);
    }

    const eventIds = await Promise.all(
      eventRangeOfIndex.map(index =>
        this.contractService.eventContract.methods
          .tokenEventsList(certificateId, index).call()
          .then((eventIdBn) => eventIdBn)
      )
    );

    return Promise.all(
      eventIds.map(async (eventId) => {
        return this.getArianeeEvent(eventId, certificateId, rpcEndpoint, false, passphrase);
      })
    );
  }

  private getPendingEvents = async (certificateId, rpcEndpoint, passphrase?) => {
    const pendingEventLenth = await this.contractService.eventContract.methods.pendingEventsLength(certificateId)
      .call();

    const eventRangeOfIndex = [];

    for (let i = 0; i < <any>pendingEventLenth; i++) {
      eventRangeOfIndex.push(i);
    }

    const pendingEventIds = await Promise.all(
      eventRangeOfIndex.map(index =>
        this.contractService.eventContract.methods
          .pendingEvents(certificateId, index).call()
          .then((eventIdBn) => eventIdBn)
      )
    );

    return Promise.all(
      pendingEventIds.map(async (eventId) => {
        return this.getArianeeEvent(eventId, certificateId, rpcEndpoint, true, passphrase);
      })
    );
  }

  private getArianeeEvent= async (arianeeEventId, certificateId, rpcEndpoint, isPending, passphrase?):Promise<ArianeeEvent> => {
    const eventBc:any = await this.contractService.eventContract.methods.getEvent(arianeeEventId).call();

    const getTimestamp = async ():Promise<number> => {
      const creationEvent:BlockchainEvent[] = await this.contractService.eventContract.getPastEvents(
        blockchainEventsName.arianeeEvent.eventCreated,
        { fromBlock: 0, toBlock: 'latest', filter: { _eventId: arianeeEventId } }
      );
      return this.utils.getTimestampFromBlock(creationEvent[0].blockNumber);
    };

    const getEventContent = async ():Promise<CertificateContentContainer<any>> => {
      const requestBody: any = {
        eventId: arianeeEventId,
        certificateId: certificateId
      };

      let privateKey: string;

      if (passphrase) {
        privateKey = this.configurationService
          .walletFactory()
          .fromPassPhrase(passphrase).privateKey;
        requestBody.authentification = await this.utils.signProofForRpc(
          certificateId,
          privateKey
        );
      } else {
        privateKey = this.walletService.privateKey;
        requestBody.authentification = await this.utils.signProofForRpc(
          certificateId,
          privateKey
        );
      }

      let eventContent:EventContent;

      try {
        const RPCEvent = await this.httpClient.RPCCall<EventContent>(
          rpcEndpoint,
          'event.read',
          requestBody
        );

        eventContent = RPCEvent.result;
      } catch (err) {
        eventContent = undefined;
      }

      if (eventContent) {
        const $schema = await this.httpClient.fetch(eventContent.$schema);

        const hash = await this.utils.cert(
          $schema,
          eventContent
        );

        const tokenImprint = await this.contractService.eventContract.methods.getEvent(arianeeEventId).call();

        const isCertificateContentValid = hash === tokenImprint[1];
        return {
          data: eventContent,
          imprint: tokenImprint[1],
          isAuthentic: isCertificateContentValid,
          raw: eventContent
        };
      } else {
        return {
          data: eventContent,
          imprint: undefined,
          isAuthentic: false,
          raw: eventContent
        };
      }
    };

    const [issuer, timestamp, content] = await Promise.all([
      this.identityService.getIdentity({ address: eventBc['2'], query: { issuer: true } }),
      getTimestamp(),
      getEventContent()
    ]);

    return {
      certificateId,
      timestamp: timestamp,
      issuer: {
        isIdentityVerified: issuer.isApproved,
        isIdentityAuthentic: issuer.isAuthentic,
        imprint: issuer.imprint,
        identity: issuer
      },
      arianeeEventId,
      content,
      pending: isPending
    };
  }

  public acceptArianeeEvent = (eventId) => {
    return this.contractService.storeContract.methods
      .acceptEvent(eventId, this.configurationService.arianeeConfiguration.walletReward.address).send();
  }

  public refuseArianeeEvent = (eventId) => {
    return this.contractService.storeContract.methods
      .refuseEvent(eventId, this.configurationService.arianeeConfiguration.walletReward.address).send();
  }

  /**
   * Sotre content to Arianee Privacy Gateway
   * @param {ArianeeTokenId} certificateId
   * @param {number} arianeeEventId
   * @param content
   * @param {string} url: if not url is specified, fallback to default rpc, if not fallback to rpc of issuer
   * @returns {Promise<{jsonrpc: number; id: string; result?: any}>}
   */
  public storeArianeeEventContentInRPCServer =async (
    certificateId:ArianeeTokenId,
    arianeeEventId:number,
    content,
    url?: string) => {
    const arianeePrivacyGatewayURL = await this
      .arianeePrivacyGateWayService
      .getArianeePrivacyURLORFallback(url, certificateId);

    return this.httpClient.RPCCall(arianeePrivacyGatewayURL, 'event.create', {
      certificateId: certificateId,
      eventId: arianeeEventId,
      json: content
    });
  }

  public createAndStoreArianeeEvent=async (data: {
    uri?: string;
    certificateId: number,
    arianeeEventId?:number;
    content?: { $schema: string;[key: string]: any };
  }, url?:string) => {
    const result = await this.createArianeeEvent(data);

    await this.storeArianeeEventContentInRPCServer(data.certificateId, result.arianeeEventId, data.content, url);

    return result;
  }

  generateAvailableArianeeEventId= async ():Promise<number> => {
    const arianeeEventId = this.utils.createUID();

    const isFree = this.isArianeeEventIdFree(arianeeEventId);

    if (isFree) {
      return arianeeEventId;
    } else {
      return this.generateAvailableArianeeEventId();
    }
  }

  private isArianeeEventIdFree = async (arianeeEventId:number):Promise<boolean> => {
    try {
      await this.contractService.eventContract.methods.getEvent(arianeeEventId).call();
      return false;
    } catch {
      return true;
    }
  }

  public createArianeeEvent=async (data: {
    uri?: string;
    contentImprint?: string;
    certificateId: number,
    arianeeEventId?:number;
    content?: { $schema: string;[key: string]: any };
  }):Promise<
      { contentImprint: string,
       arianeeEventId: number}
    > => {
    if (data.arianeeEventId) {
      const arianeeEventIdIsAvailable = await this.isArianeeEventIdFree(data.arianeeEventId);

      if (!arianeeEventIdIsAvailable) {
        throw new Error(`Arianee Event id (${data.arianeeEventId}) is not available`);
      }
    } else {
      data.arianeeEventId = await this.generateAvailableArianeeEventId();
    }

    data.uri = data.uri || '';

    let { arianeeEventId, certificateId, contentImprint, uri, content } = data;
    const brandReward = this.configurationService.arianeeConfiguration.brandDataHubReward.address;

    console.assert(
      !(contentImprint && content),
      'you should choose between contentImprint parameter and content contentImprint'
    );

    console.assert(
      !(isNullOrUndefined(contentImprint) && isNullOrUndefined(content)),
      'you should pass at least on parameter'
    );

    if (content) {
      const certificateSchema = await this.httpClient.fetch(
        content.$schema
      );

      contentImprint = await this.utils.cert(certificateSchema, content);
    }

    try {
      const result = await this.contractService.storeContract.methods.createEvent(arianeeEventId, certificateId, contentImprint, uri, brandReward).send();

      return {
        store: this.storeArianeeEventContentInRPCServer,
        ...result,
        contentImprint: contentImprint,
        arianeeEventId: arianeeEventId
      };
    } catch (e) {
      const diagnosis = await this.diagnosisService.diagnosis([
        this.diagnosisService.isStoreApprove(),
        this.diagnosisService.isEventCredit()
      ]);
      return Promise.reject(diagnosis);
    }
  }
}
