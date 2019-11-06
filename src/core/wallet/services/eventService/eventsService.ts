import { injectable } from 'tsyringe';
import { blockchainEventsName } from '../../../../models/blockchainEventsName';
import { CertificateId } from '../../../../models/CertificateId';
import { ArianeeHttpClient } from '../../../libs/arianeeHttpClient/arianeeHttpClient';
import { sortEvents } from '../../../libs/sortEvents';
import { ConfigurationService } from '../configurationService/configurationService';
import { ContractService } from '../contractService/contractsService';
import { IdentityService } from '../identityService/identityService';
import { UtilsService } from '../utilService/utilsService';
import { WalletService } from '../walletService/walletService';
import { ArianeeEventContent, BlockchainEvent } from '../../../../models/blockchainEvent';

@injectable()
export class EventService {
  constructor (
    private identityService: IdentityService,
    private contractService: ContractService,
    private walletService: WalletService,
    private configurationService: ConfigurationService,
    private httpClient: ArianeeHttpClient,
    private utils: UtilsService
  ) {
  }

  public getCertificateTransferEvents = async (
    certificateId: CertificateId
  ): Promise<any> => {
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
          .getIdentity(event.returnValues._to)
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

  public getCertificateArianeeEvents = async (
    certificateId: number,
    passphrase?: string
  ): Promise<any[]> => {
    const issuer = await this.contractService.smartAssetContract.methods
      .issuerOf(certificateId)
      .call();

    const issuerIdentity = await this.identityService.getIdentity(issuer);
    const validateEvents = await this.getValidateEvents(certificateId, issuerIdentity.data.rpcEndpoint, passphrase);
    const pendingEvents = await this.getPendingEvents(certificateId, issuerIdentity.data.rpcEndpoint, passphrase);

    return this.orderArianeeEvents(validateEvents.concat(pendingEvents), certificateId);
  }

  private orderArianeeEvents= async (events:any[], certificateId) => {
    const aEvents:BlockchainEvent[] = await this.contractService.eventContract.getPastEvents(blockchainEventsName.arianeeEvent.eventCreated,
      { fromBlock: 0, toBlock: 'latest', filter: { _tokenId: certificateId } });

    events.map((event) => {
      event.blockNumber = aEvents.find((aEvent) => { return aEvent.returnValues._eventId === event.id; }).blockNumber;
    });

    return events.sort(sortEvents);
  }

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
        return this.getArianeeEvent(eventId, certificateId, rpcEndpoint, passphrase)
          .then(event => { return { ...event, pending: false }; });
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
        return this.getArianeeEvent(eventId, certificateId, rpcEndpoint, passphrase)
          .then(event => { return { ...event, pending: true }; });
      })
    );
  }

  private getArianeeEvent= async (eventId, certificateId, rpcEndpoint, passphrase?) => {
    const event:ArianeeEventContent = { id: eventId };
    const eventBc:any = await this.contractService.eventContract.methods.getEvent(eventId).call();
    const creationEvent:BlockchainEvent[] = await this.contractService.eventContract.getPastEvents(
      blockchainEventsName.arianeeEvent.eventCreated,
      { fromBlock: 0, toBlock: 'latest', filter: { _eventId: eventId } }
    );

    event.identity = await this.identityService.getIdentity(eventBc['2']);
    event.timestamp = await this.utils.getTimestampFromBlock(creationEvent[0].blockNumber);

    const requestBody: any = {
      eventId: eventId,
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
    event.content = await this.httpClient.RPCCallWithCache(
      rpcEndpoint,
      'event.read',
      requestBody
    );

    return event;
  }

  public acceptArianeeEvent = (eventId) => {
    return this.contractService.storeContract.methods
      .acceptEvent(eventId, this.configurationService.arianeeConfiguration.walletReward.address).send();
  }

  public refuseArianeeEvent = (eventId) => {
    return this.contractService.storeContract.methods
      .refuseEvent(eventId, this.configurationService.arianeeConfiguration.walletReward.address).send();
  }
}
