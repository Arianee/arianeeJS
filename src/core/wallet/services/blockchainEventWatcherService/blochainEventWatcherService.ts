import { injectable } from 'tsyringe';
import { BlockchainEventWatcherEnum } from '../../../../models/enum';
import { ContractName, ContractService } from '../contractService/contractsService';

import { WalletService } from '../walletService/walletService';
import { SimpleStore } from '../../../libs/simpleStore/simpleStore';
import { ArianeeEventEmitter, ArianeListenerEvent } from '../arianeeEventEmitterService/ArianeeEventEmitter';

import { Web3Service } from '../web3Service/web3Service';
import { blockchainEventsName } from '../../../../models/blockchainEventsName';
import { WatchParameter } from '../../../../models/watchParameter';
import { GetPastEventService } from '../getPastEventService/getPastEventService';

const blockchainEventCursorNamespaceKey = 'blockchainEventCursor';

@injectable()
export class BlockchainEventWatcherService {
  constructor (
      private contractService:ContractService,
      private walletService:WalletService,
      public store: SimpleStore,
      private eventEmitter: ArianeeEventEmitter,
      private web3Service:Web3Service,
      private getPastEventService:GetPastEventService
  ) {
    eventEmitter.EE.on(ArianeListenerEvent.newListener, async (event) => {
      this.watcherParameters
      // is event handle by our watchers
        .filter(conf => conf.eventNames.includes(event))
      // there is no on going watcher yet. Avoid double watcher.
        .filter(conf => !this.onGoingWatchers.has(this.createCompositeIdWatcher(conf.eventNames)))
        .forEach(async (conf) => {
          this.onGoingWatchers.add(this.createCompositeIdWatcher(conf.eventNames));
          this.watch(conf);
        });
    });
  }

  private createCompositeIdWatcher = (eventNames:string[]) => {
    return eventNames.sort().join();
  }

  private onGoingWatchers=new Set();

  public timeout=2000;

  public addWatchParameter=(watcherParameter:WatchParameter) => {
    this.watcherParameters.push(watcherParameter);
  }

  public watcherParameters:WatchParameter[]=[
    {
      contract: this.contractService[ContractName.smartAssetContract],
      filter: { _from: this.walletService.address },
      blockchainEvent: blockchainEventsName.smartAsset.transfer,
      eventNames: [BlockchainEventWatcherEnum.Transfer, BlockchainEventWatcherEnum.TransferFrom]
    },
    {
      contract: this.contractService[ContractName.smartAssetContract],
      filter: { _to: this.walletService.address },
      blockchainEvent: blockchainEventsName.smartAsset.transfer,
      eventNames: [BlockchainEventWatcherEnum.Transfer, BlockchainEventWatcherEnum.TransferTo]
    },
    {
      contract: this.contractService[ContractName.identityContract],
      filter: {},
      blockchainEvent: blockchainEventsName.identity.IdentityUpdate,
      eventNames: [BlockchainEventWatcherEnum.IdentityUpdate]
    },
    {
      contract: this.contractService[ContractName.identityContract],
      filter: {},
      blockchainEvent: blockchainEventsName.identity.IdentityValidate,
      eventNames: [BlockchainEventWatcherEnum.IdentityValidate]
    },
    {
      contract: this.contractService[ContractName.messageContract],
      blockchainEvent: blockchainEventsName.message.MessageSent,
      filter: { _receiver: this.walletService.address },
      eventNames: [BlockchainEventWatcherEnum.MessageReceive]
    }
  ]

  public watch = async (conf:WatchParameter) => {
    setTimeout(async () => {
      const { contract, filter, blockchainEvent, eventNames } = conf;

      const contractAddress = contract.options.address;
      const cursorKey = blockchainEvent.concat(JSON.stringify(filter)) + contractAddress;

      const currentBlock = await this.web3Service.web3.eth.getBlockNumber();

      const cursor:number = await this.store.get(blockchainEventCursorNamespaceKey, cursorKey, () => Promise.resolve(currentBlock - 1));

      if (currentBlock > cursor) {
        const pastEvent = await this.getPastEventService.getPastEvents(
          contractAddress,
          blockchainEvent,
          { fromBlock: cursor, toBlock: currentBlock, filter: filter }
        );

        this.store.set(blockchainEventCursorNamespaceKey, cursorKey, currentBlock + 1);

        eventNames.forEach((eventName) => {
          if (pastEvent.length > 0) {
            this.eventEmitter.EE.emit(eventName, pastEvent);
          }
        });
      }
      const sumOfListeners = eventNames.reduce((acc, eventName) => {
        return acc + this.eventEmitter.EE.listeners(eventName).length;
      }, 0);

      if (sumOfListeners > 0) {
        this.watch(conf);
      } else {
        this.onGoingWatchers.delete(this.createCompositeIdWatcher(conf.eventNames));
      }
    }, this.timeout);
  };
}
