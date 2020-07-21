import { injectable } from 'tsyringe';
import { BlockchainEventWatcherEnum } from '../../../../models/enum';
import { ContractService } from '../contractService/contractsService';

import { WalletService } from '../walletService/walletService';
import { SimpleStore } from '../../../libs/simpleStore/simpleStore';
import { ArianeeEventEmitter, ArianeListenerEvent } from '../arianeeEventEmitterService/ArianeeEventEmitter';

import { Web3Service } from '../web3Service/web3Service';
import { blockchainEventsName } from '../../../../models/blockchainEventsName';
import { watchParameter } from '../../../../models/watchParameter';

const blockchainEventCursorNamespaceKey = 'blockchainEventCursor';

@injectable()
export class BlockchainEventWatcherService {
  constructor (
    private contractService:ContractService,
    private walletService:WalletService,
    public store: SimpleStore,
    private eventEmitter: ArianeeEventEmitter,
    private web3Service:Web3Service
  ) {
    eventEmitter.EE.on(ArianeListenerEvent.newListener, async (event) => {
      this.watcherParameters
        .filter(conf => conf.eventNames.includes(event))
        .filter(conf => eventEmitter.EE.listeners(conf.blockchainEvent).length === 0)
        .forEach(async (conf) => {
          this.watch(conf);
        });
    });
  }

  public timeout=2000;

  public watcherParameters:watchParameter[]=[
    {
      contract: this.contractService.smartAssetContract,
      filter: { _from: this.walletService.address },
      blockchainEvent: blockchainEventsName.smartAsset.transfer,
      eventNames: [BlockchainEventWatcherEnum.Transfer, BlockchainEventWatcherEnum.TransferFrom]
    },
    {
      contract: this.contractService.smartAssetContract,
      filter: { _to: this.walletService.address },
      blockchainEvent: blockchainEventsName.smartAsset.transfer,
      eventNames: [BlockchainEventWatcherEnum.Transfer, BlockchainEventWatcherEnum.TransferTo]
    },
    {
      contract: this.contractService.identityContract,
      filter: {},
      blockchainEvent: blockchainEventsName.identity.IdentityUpdate,
      eventNames: [BlockchainEventWatcherEnum.IdentityUpdate]
    },
    {
      contract: this.contractService.identityContract,
      filter: {},
      blockchainEvent: blockchainEventsName.identity.IdentityValidate,
      eventNames: [BlockchainEventWatcherEnum.IdentityValidate]
    },
    {
      contract: this.contractService.messageContract,
      filter: { _receiver: this.walletService.address },
      blockchainEvent: blockchainEventsName.message.MessageSent,
      eventNames: [BlockchainEventWatcherEnum.MessageReceive]
    }
  ]

  watch = async (conf:watchParameter) => {
    setTimeout(async () => {
      const { contract, filter, blockchainEvent, eventNames } = conf;
      const cursorKey = blockchainEvent.concat(JSON.stringify(filter)) + contract.options.address;

      const currentBlock = await this.web3Service.web3.eth.getBlockNumber();

      const cursor:number = await this.store.get(blockchainEventCursorNamespaceKey, cursorKey, () => Promise.resolve(currentBlock - 1));

      if (currentBlock > cursor) {
        const pastEvent = await contract.getPastEvents(
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
      }
    }, this.timeout);
  };
}
