import { ArianeeEventEmitter } from '../../wallet/services/arianeeEventEmitterService/ArianeeEventEmitter';
import { SimpleStore } from './simpleStore';
import { Store } from './store';
import { ArianeeHttpClient } from '../arianeeHttpClient/arianeeHttpClient';

import { ConfigurationService } from '../../wallet/services/configurationService/configurationService';
import { WalletService } from '../../wallet/services/walletService/walletService';

const mockResponse = 'mockResponse';
const countMock = jest.fn();
const url = 'https://myurl.com/zef';

jest.mock('../../wallet/services/walletService/walletService');
jest.mock('axios', () => url => {
  countMock(url);

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({ data: mockResponse });
    });
  });
});

describe('SimpleStore', () => {
  let params, configurationServiceStub, walletServiceStub;

  beforeEach(() => {
    params = {
      chainId: 1
    };
    configurationServiceStub = () => {
      return {
        arianeeConfiguration: {
          chainId: params.chainId
        }
      } as ConfigurationService;
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('store', () => {
    it('should fetch one', async () => {
      const store = new Store();
      const configService = configurationServiceStub();
      const walletService = new WalletService({} as any, {} as any, {} as any);
      const simpleStore = new SimpleStore(store, configService, walletService, new ArianeeEventEmitter());
      const httpClient = new ArianeeHttpClient();

      const result = await simpleStore.get('test', 'test', () => httpClient.fetch(url));

      expect(countMock).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockResponse);
    });

    it('should fetch once with 2 calls at same time', async () => {
      const store = new Store();
      const configService = configurationServiceStub();
      const walletService = new WalletService({} as any, {} as any, {} as any);
      const simpleStore = new SimpleStore(store, configService, walletService, new ArianeeEventEmitter());
      const httpClient = new ArianeeHttpClient();
      simpleStore.get('test', 'test', () => httpClient.fetch(url));

      const result = await simpleStore.get('test', 'test', () => httpClient.fetch(url));

      expect(countMock).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockResponse);
    });

    it('should fetch once with 2 calls one after the other', async () => {
      const store = new Store();
      const configService = configurationServiceStub();
      const walletService = new WalletService({} as any, {} as any, {} as any);
      const simpleStore = new SimpleStore(store, configService, walletService, new ArianeeEventEmitter());
      const httpClient = new ArianeeHttpClient();
      await simpleStore.get('test', 'test', () => httpClient.fetch(url));

      const result = await simpleStore.get('test', 'test', () => httpClient.fetch(url));

      expect(countMock).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockResponse);
    });

    it('should fetch twice if chainId change', async () => {
      const store = new Store();

      const configService = configurationServiceStub();
      const walletService = new WalletService({} as any, {} as any, {} as any);
      const simpleStore = new SimpleStore(store, configService, walletService, new ArianeeEventEmitter());

      const httpClient = new ArianeeHttpClient();
      await simpleStore.get('test', 'test', () => httpClient.fetch(url));

      // @ts-ignore
      simpleStore.arianeeConfig.arianeeConfiguration.chainId = 2;
      const result = await simpleStore.get('test', 'test', () => httpClient.fetch(url));

      expect(countMock).toHaveBeenCalledTimes(2);
      expect(result).toBe(mockResponse);
    });
    it('should fetch twice if privateKey Change change', async () => {
      const store = new Store();

      const configService = configurationServiceStub();
      const walletService = new WalletService({} as any, {} as any, {} as any);
      const simpleStore = new SimpleStore(store, configService, walletService, new ArianeeEventEmitter());

      const httpClient = new ArianeeHttpClient();
      await simpleStore.get('test', 'test', () => httpClient.fetch(url));

      // @ts-ignore
      simpleStore.walletService.account.address = 2;

      const result = await simpleStore.get('test', 'test', () => httpClient.fetch(url));

      expect(countMock).toHaveBeenCalledTimes(2);
      expect(result).toBe(mockResponse);
    });
  });

  describe('force refresh', () => {
    test('should RE fetch', async () => {
      const store = new Store();
      const configService = configurationServiceStub();
      const walletService = new WalletService({} as any, {} as any, {} as any);
      const simpleStore = new SimpleStore(store, configService, walletService, new ArianeeEventEmitter());
      const httpClient = jest.fn().mockImplementation(() => Promise.resolve('data'));

      await simpleStore.get('test', 'test', httpClient);
      await simpleStore.get('test', 'test', httpClient, true);
      expect(httpClient).toHaveBeenCalledTimes(2);
    });
    test('should NOT fetch', async () => {
      const store = new Store();
      const configService = configurationServiceStub();
      const walletService = new WalletService({} as any, {} as any, {} as any);
      const simpleStore = new SimpleStore(store, configService, walletService, new ArianeeEventEmitter());
      const httpClient = jest.fn().mockImplementation(() => Promise.resolve('data'));

      await simpleStore.get('test', 'test', httpClient);
      await simpleStore.get('test', 'test', httpClient, false);
      expect(httpClient).toHaveBeenCalledTimes(1);
    });
  });
});
