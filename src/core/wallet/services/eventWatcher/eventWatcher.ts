import { injectable } from 'tsyringe';
import { ContractService } from '../contractService/contractsService';

import { WalletService } from '../walletService/walletService';
import { SimpleStore } from '../../../libs/simpleStore/simpleStore';
import { ArianeeEventEmitter } from '../../../libs/arianeeEventEmitter/ArianeeEventEmitter';

import { Web3Service } from '../web3Service/web3Service';
import { blockchainEventsName } from '../../../../models/blockchainEventsName';
import { watcherParameter } from '../../../../models/watcherParameter';

@injectable()
export class EventWatcherCustom {
  constructor (
    private contractService:ContractService,
    private walletService:WalletService,
    public store: SimpleStore,
    private eventEmitter: ArianeeEventEmitter,
    private web3Service:Web3Service
  ) {
    eventEmitter.EE.on('newListener', async (event) => {
      this.watcherParameters
        .filter(conf => conf.eventNames.includes(event))
        .filter(conf => eventEmitter.EE.listeners(conf.blockchainEvent).length === 0)
        .forEach(async (conf) => {
          this.watch(conf);
        });
    });
  }

  public watcherParameters:watcherParameter[]=[
    {
      contract: this.contractService.smartAssetContract,
      filter: { _from: this.walletService.publicKey },
      blockchainEvent: blockchainEventsName.smartAsset.transfer,
      eventNames: ['Transfer', 'TransferFrom']
    },
    {
      contract: this.contractService.smartAssetContract,
      filter: { _to: this.walletService.publicKey },
      blockchainEvent: blockchainEventsName.smartAsset.transfer,
      eventNames: ['Transfer', 'TransferTo']
    }
  ]

  watch = async (conf:watcherParameter) => {
    setTimeout(async () => {
      const { contract, filter, blockchainEvent, eventNames } = conf;
      const cursorKey = blockchainEvent.concat(JSON.stringify(filter)) + contract.options.address;

      const currentBlock = await this.web3Service.web3.eth.getBlockNumber();

      const cursor:number = await this.store.get('blockchainEventCursor', cursorKey, () => Promise.resolve(currentBlock - 1));

      if (currentBlock > cursor) {
        const pastEvent = await contract.getPastEvents(
          blockchainEvent,
          { fromBlock: cursor, toBlock: currentBlock, filter: filter }
        );

        this.store.set('blockchainEventCursor', cursorKey, currentBlock + 1);

        const sumOfListeners = eventNames.reduce((acc, eventName) => {
          return acc + this.eventEmitter.EE.listeners(eventName).length;
        }, 0);

        if (sumOfListeners > 0) {
          this.watch(conf);
        }

        eventNames.forEach((eventName) => {
          if (pastEvent.length > 0) {
            this.eventEmitter.EE.emit(eventName, pastEvent);
          }
        });
      }
    }, 2000);
  };
}
