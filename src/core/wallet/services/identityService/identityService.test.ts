import { ArianeeHttpClient } from '../../../libs/arianeeHttpClient/arianeeHttpClient';
import { SimpleStore } from '../../../libs/simpleStore/simpleStore';
import { ContractService } from '../contractService/contractsService';
import { EventService } from '../eventService/eventsService';
import { GlobalConfigurationService } from '../globalConfigurationService/globalConfigurationService';
import { UtilsService } from '../utilService/utilsService';
import { WalletService } from '../walletService/walletService';
import { Web3Service } from '../web3Service/web3Service';
import { IdentityService } from './identityService';
import { ArianeeBlockchainProxyService } from '../arianeeBlockchainProxyService/arianeeBlockchainProxyService';

describe('IdentityService', () => {
  const getAllDependencies = () => {
    const utils: UtilsService = {} as UtilsService;
    const simpleStore: SimpleStore = {
      get: (namespace:string, key: string, getter: ()=> Promise<any>, force = false) => getter()
    } as SimpleStore;

    const httpClient: ArianeeHttpClient = {} as ArianeeHttpClient;
    const contractService: ContractService = {
      identityContract: {
        methods: {
          addressURI: () => ({ call: () => Promise.resolve('zefzef') }),
          waitingURI: () => ({ call: () => Promise.resolve('zefzef') })
        }
      }
    } as any;
    const globalConfigurationService = new GlobalConfigurationService();
    const walletService: WalletService = {} as WalletService;
    const eventService: EventService = {} as EventService;
    const web3Service: Web3Service = {} as Web3Service;
    const arianeeBlockchainProxyService: ArianeeBlockchainProxyService = {
      getAddressURI: () => Promise.resolve('https://Myuri.com')
    } as any;
    return {
      utils,
      simpleStore,
      httpClient,
      contractService,
      globalConfigurationService,
      arianeeBlockchainProxyService
    };
  };

  test('should init', () => {
    const deps = getAllDependencies();
    const instance = new IdentityService(deps.httpClient
      , deps.utils
      , deps.contractService
      , deps.globalConfigurationService
      , deps.simpleStore
      , deps.arianeeBlockchainProxyService);

    expect(instance).toBeDefined();
  });

  describe('getIdentity', function () {
    describe('fail to fetch', () => {
      test('should return an object', async (done) => {
        const deps = getAllDependencies();

        const instance = new IdentityService(deps.httpClient
          , deps.utils
          , deps.contractService
          , deps.globalConfigurationService
          , deps.simpleStore
          , deps.arianeeBlockchainProxyService);

        var d = await instance.getIdentity({ address: '0', query: { issuer: true } });

        expect(d).toBeDefined();
        expect(d.data).toBeUndefined();
        expect(d.address).toBe('0');

        done();
      });
    });
    describe('waiting vs not waiting identity', () => {
      test('should fetch identity (not waiting)', async (done) => {
        const deps = getAllDependencies();

        const spyWaitingURI = jest.spyOn(deps.contractService.identityContract.methods, 'waitingURI');
        const spyAddressURI = jest.spyOn(deps.arianeeBlockchainProxyService, 'getAddressURI');

        const instance = new IdentityService(deps.httpClient
          , deps.utils
          , deps.contractService
          , deps.globalConfigurationService
          , deps.simpleStore
          , deps.arianeeBlockchainProxyService);

        await instance.getIdentity({ address: '0', query: { issuer: true } });

        expect(spyAddressURI).toHaveBeenCalled();
        expect(spyWaitingURI).toHaveBeenCalledTimes(0);

        done();
      });

      test('should fetch waiting identity ', async (done) => {
        const deps = getAllDependencies();
        const spyWaitingURI = jest.spyOn(deps.contractService.identityContract.methods, 'waitingURI');

        const instance = new IdentityService(deps.httpClient
          , deps.utils
          , deps.contractService
          , deps.globalConfigurationService
          , deps.simpleStore
          , deps.arianeeBlockchainProxyService);

        await instance.getIdentity({ address: '0', query: { issuer: { waitingIdentity: true } } });

        expect(spyWaitingURI).toHaveBeenCalled();

        done();
      });
    });
  });
});
