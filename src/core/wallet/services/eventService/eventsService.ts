import { get } from 'lodash';
import { injectable } from 'tsyringe';
import { ArianeeTokenId } from '../../../../models/ArianeeTokenId';
import { BlockchainEvent, EventContent } from '../../../../models/blockchainEvent';
import { blockchainEventsName } from '../../../../models/blockchainEventsName';
import { ArianeeHttpClient } from '../../../libs/arianeeHttpClient/arianeeHttpClient';
import { isCertificateI18n } from '../../../libs/certificateVersion';
import { replaceLanguage } from '../../../libs/i18nSchemaLanguageManager/i18nSchemaLanguageManager';
import { isNullOrUndefined } from '../../../libs/isNullOrUndefined';
import { sortEvents } from '../../../libs/sortEvents';
import { ArianeeEvent, ConsolidatedCertificateRequest } from '../../certificateSummary/certificateSummary';
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
    private diagnosisService:DiagnosisService
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

    const issuerIdentity = await this.identityService.getIdentity({ address: issuer, query });

    const [validateEvents, pendingEvents] = await Promise.all([
      this.getValidateEvents(certificateId, issuerIdentity.data.rpcEndpoint, passphrase),
      this.getPendingEvents(certificateId, issuerIdentity.data.rpcEndpoint, passphrase)
    ]);
    const allEvents = [...validateEvents, ...pendingEvents];

    const orderedArianeeEvents = allEvents.sort(EventService.orderArianeeEvents);

    if (get(query, 'advanced.languages')) {
      return orderedArianeeEvents
        .map(arianeeEvent => {
          if (isCertificateI18n(arianeeEvent.content.data)) {
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

    const getEventContent = async () => {
      const requestBody: any = {
        eventId: arianeeEventId,
        certificateId: certificateId
      };

      let privateKey: string;

      if (passphrase) {
        privateKey = this.configurationService
          .walletFactory()
          .fromPassPhrase(passphrase).privateKey;
        requestBody.authentification = this.utils.signProofForRpc(
          certificateId,
          privateKey
        );
      } else {
        privateKey = this.walletService.privateKey;
        requestBody.authentification = this.utils.signProofForRpc(
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
          isAuthentic: isCertificateContentValid
        };
      } else {
        return {
          data: eventContent,
          imprint: undefined,
          isAuthentic: false
        };
      }
    };

    const [issuer, timestamp, content] = await Promise.all([
      this.identityService.getIdentity({ address: eventBc['2'], query: { issuer: true } }),
      getTimestamp(),
      getEventContent(),
      getEventContent()
    ]);

    return {
      certificateId,
      timestamp: timestamp,
      issuer: {
        isIdentityVerified: issuer.isApproved,
        isIdentityAuthentic: issuer.isAuthentic,
        imprint: issuer.imprint,
        identity: issuer.data
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

  public storeArianeeEventContentInRPCServer =async (
    certificateId:ArianeeTokenId,
    arianeeEventId:number,
    content,
    url:string) => {
    return this.httpClient.RPCCall(url, 'event.create', {
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
  }, url:string) => {
    const result = await this.createArianeeEvent(data);
    await this.storeArianeeEventContentInRPCServer(data.certificateId, result.arianeeEventId, data.content, url);

    return result;
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
    data.arianeeEventId = data.arianeeEventId || this.utils.createUID();
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
