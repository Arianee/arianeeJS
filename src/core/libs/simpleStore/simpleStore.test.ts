import { SimpleStore } from './simpleStore';
import { Store } from './store';
import { ArianeeHttpClient } from '../arianeeHttpClient/arianeeHttpClient';
import { SimpleSessionCache } from '../simpleCache/simpleSessionCache';
import { WalletService } from '../../wallet/services/walletService/walletService';
import { ConfigurationService } from '../../wallet/services/configurationService/configurationService';

const mockResponse = 'mockResponse';
const countMock = jest.fn();
const url = 'https://myurl.com/zef';

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
      chainId: 1,
      publicKey: '0x123'
    };
    configurationServiceStub = () => {
      return {
        arianeeConfiguration: {
          chainId: params.chainId
        }
      } as ConfigurationService;
    };

    walletServiceStub = new WalletService();
    walletServiceStub.account = {
      address: params.publicKey
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch one', async () => {
    const store = new Store();
    const configService = configurationServiceStub();
    const simpleStore = new SimpleStore(store, configService, walletServiceStub);
    const simpleCache = new SimpleSessionCache();
    const httpClient = new ArianeeHttpClient(simpleCache);

    const result = await simpleStore.get('test', 'test', () => httpClient.fetch(url));

    expect(countMock).toHaveBeenCalledTimes(1);
    expect(result).toBe(mockResponse);
  });

  it('should fetch once with 2 calls at same time', async () => {
    const store = new Store();
    const configService = configurationServiceStub();
    const simpleStore = new SimpleStore(store, configService, walletServiceStub);
    const simpleCache = new SimpleSessionCache();
    const httpClient = new ArianeeHttpClient(simpleCache);
    simpleStore.get('test', 'test', () => httpClient.fetch(url));

    const result = await simpleStore.get('test', 'test', () => httpClient.fetch(url));

    expect(countMock).toHaveBeenCalledTimes(1);
    expect(result).toBe(mockResponse);
  });

  it('should fetch once with 2 calls one after the other', async () => {
    const store = new Store();
    const configService = configurationServiceStub();
    const simpleStore = new SimpleStore(store, configService, walletServiceStub);
    const simpleCache = new SimpleSessionCache();
    const httpClient = new ArianeeHttpClient(simpleCache);
    await simpleStore.get('test', 'test', () => httpClient.fetch(url));

    const result = await simpleStore.get('test', 'test', () => httpClient.fetch(url));

    expect(countMock).toHaveBeenCalledTimes(1);
    expect(result).toBe(mockResponse);
  });

  it('should fetch twice if chainId change', async () => {
    const store = new Store();

    const configService = configurationServiceStub();
    const simpleStore = new SimpleStore(store, configService, walletServiceStub);
    const simpleCache = new SimpleSessionCache();

    const httpClient = new ArianeeHttpClient(simpleCache);
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
    const simpleStore = new SimpleStore(store, configService, walletServiceStub);
    const simpleCache = new SimpleSessionCache();

    const httpClient = new ArianeeHttpClient(simpleCache);
    await simpleStore.get('test', 'test', () => httpClient.fetch(url));

    // @ts-ignore
    simpleStore.walletService.account.address = 2;

    const result = await simpleStore.get('test', 'test', () => httpClient.fetch(url));

    expect(countMock).toHaveBeenCalledTimes(2);
    expect(result).toBe(mockResponse);
  });
});
