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

const watcherParameterFactory = () => {
  const stubContract = {
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
  const stubGetPastEvent = jest.fn();
  let contractService: ContractService,
    store: SimpleStore,
    arianeeEventEmitter: ArianeeEventEmitter,
    web3Service: Web3Service, eventWatcher: BlockchainEventWatcherService;
  beforeEach(() => {
    jest.clearAllMocks();
    let configurationService = new ConfigurationService();
    configurationService = {
      arianeeConfiguration: {
        chainId: 222
      }
    } as any;

    arianeeEventEmitter = new ArianeeEventEmitter();
    contractService = {} as ContractService;
    store = new SimpleStore(new Store(),
      configurationService,
      new WalletService({} as any, {} as any, {} as any),
      arianeeEventEmitter);

    let blockNumber = 10;

    const configurationServiceMock = { isProxyEnable: () => false } as ConfigurationService;

    web3Service = {

      web3: {
        eth: {
          getBlockNumber: () => Promise.resolve(blockNumber++)
        }
      }
    } as Web3Service;

    eventWatcher = new BlockchainEventWatcherService(
      contractService,
      new WalletService({} as any, {} as any, {} as any),
      store,
      arianeeEventEmitter,
      web3Service,
      {
        getPastEvents: stubGetPastEvent
      } as any,
      configurationServiceMock);
    eventWatcher.timeout = 10;
  });

  it('should be initialized', () => {
    expect(eventWatcher).toBeDefined();
  });

  it('should do emit one event at each Transfer', (done) => {
    let counter = 0;

    stubGetPastEvent.mockImplementation(() => Promise.resolve(['zefzef']));
    eventWatcher.watcherParameters = watcherParameterFactory();

    const listener = arianeeEventEmitter.EE.on('Transfer', () => {
      expect(true).toBe(true);
      counter++;
      // on each event there should be one getPastEvent
      if (counter === 4) {
        expect(stubGetPastEvent).toHaveBeenCalledTimes(4);
        listener.removeListener('Transfer');
        done();
      }
    });
  });
  it('should stop requesting if no listener', () => {
    stubGetPastEvent.mockImplementation(() => Promise.resolve(['zefzef']));

    eventWatcher.watcherParameters = watcherParameterFactory();
    expect(stubGetPastEvent).toHaveBeenCalledTimes(0);
  });

  it('should stop requesting if removing listener', (done) => {
    stubGetPastEvent.mockImplementation(() => Promise.resolve(['zefzef']));

    eventWatcher.watcherParameters = watcherParameterFactory();
    const listener = arianeeEventEmitter.EE.on('Transfer', () => {});
    listener.removeListener('Transfer');
    setTimeout(() => {
      expect(stubGetPastEvent).toHaveBeenCalledTimes(1);
      done();
    }, 100);
  });

  it('should emit if one or more listeners', (done) => {
    stubGetPastEvent.mockImplementation(() => Promise.resolve(['zefzef']));
    let counter = 0;
    eventWatcher.watcherParameters = watcherParameterFactory();
    arianeeEventEmitter.EE.on('Transfer', () => { counter++; });
    arianeeEventEmitter.EE.on('Transfer', () => { counter++; });
    setTimeout(() => {
      expect(counter === 2).toBeTruthy();
      done();
    }, 15);
  });
});
