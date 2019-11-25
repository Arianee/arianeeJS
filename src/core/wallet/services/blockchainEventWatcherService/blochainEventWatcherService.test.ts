import { Contract } from 'ethers';
import { blockchainEventsName } from '../../../../models/blockchainEventsName';
import { ArianeeEventEmitter } from '../arianeeEventEmitterService/ArianeeEventEmitter';
import { SimpleStore } from '../../../libs/simpleStore/simpleStore';
import { Store } from '../../../libs/simpleStore/store';
import { ConfigurationService } from '../configurationService/configurationService';
import { ContractService } from '../contractService/contractsService';
import { WalletService } from '../walletService/walletService';
import { Web3Service } from '../web3Service/web3Service';
import { BlockchainEventWatcherService } from './blochainEventWatcherService';

jest.mock('../walletService/walletService');

const watcherParameterFactory = (getPastEvents) => {
  const stubContract = {
    getPastEvents,
    options: {
      address: '1049830493'
    }
  } as any;

  return [
    {
      contract: stubContract,
      filter: { _from: 'mypublickey' },
      blockchainEvent: blockchainEventsName.smartAsset.transfer,
      eventNames: ['Transfer', 'TransferFrom']
    }
  ];
};
describe('Event Watcher', () => {
  let contractService:ContractService, store: SimpleStore, eventEmitter: ArianeeEventEmitter, web3Service:Web3Service, eventWatcher:BlockchainEventWatcherService;
  beforeEach(() => {
    let configurationService = new ConfigurationService();
    configurationService = {
      arianeeConfiguration: {
        chainId: 222
      }
    } as any;

    contractService = {

    } as ContractService;
    store = new SimpleStore(new Store(), configurationService, new WalletService());

    let blockNumber = 10;

    eventEmitter = new ArianeeEventEmitter();
    web3Service = {

      web3: {
        eth: {
          getBlockNumber: () => Promise.resolve(blockNumber++)
        }
      }
    } as Web3Service;

    eventWatcher = new BlockchainEventWatcherService(contractService, new WalletService(), store, eventEmitter, web3Service);
    eventWatcher.timeout = 10;
  });

  it('should be initialized', () => {
    expect(eventWatcher).toBeDefined();
  });

  it('should do emit one event at each Transfer', (done) => {
    let counter = 0;

    const getPastEvent = jest.fn(() => Promise.resolve(['zefzef']));

    eventWatcher.watcherParameters = watcherParameterFactory(getPastEvent);

    eventEmitter.EE.on('Transfer', () => {
      expect(true).toBe(true);
      counter++;
      if (counter === 4) {
        expect(getPastEvent).toHaveBeenCalledTimes(4);
        done();
      }
    });
  });

  it('should stop requesting if no listener', () => {
    const getPastEvent = jest.fn(() => Promise.resolve(['zefzef']));

    eventWatcher.watcherParameters = watcherParameterFactory(getPastEvent);
    expect(getPastEvent).toHaveBeenCalledTimes(0);
  });

  it('should stop requesting if removing listener', (done) => {
    const getPastEvent = jest.fn(() => Promise.resolve(['zefzef']));

    eventWatcher.watcherParameters = watcherParameterFactory(getPastEvent);
    const listener = eventEmitter.EE.on('Transfer', () => {});
    listener.removeListener('Transfer');
    setTimeout(() => {
      expect(getPastEvent).toHaveBeenCalledTimes(1);
      done();
    }, 20);
  });

  it('should emit if one or more listeners', (done) => {
    const getPastEvent = jest.fn(() => Promise.resolve(['zefzef']));
    let counter = 0;
    eventWatcher.watcherParameters = watcherParameterFactory(getPastEvent);
    eventEmitter.EE.on('Transfer', () => { counter++; });
    eventEmitter.EE.on('Transfer', () => { counter++; });
    setTimeout(() => {
      expect(counter === 2).toBeTruthy();
      done();
    }, 15);
  });
});
