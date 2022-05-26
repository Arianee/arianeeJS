import { GetPastEventService } from './getPastEventService';
import { ContractName } from '../contractService/contractsService';

describe('getPastEvent', () => {
  const web3Service = {
    web3: {
      utils: {
        isAddress: () => true
      }
    }
  } as any;
  const getPastEventsBlockChainMock = jest.fn();
  const mockgetInstanceFromAddressOrName = () => {
    return {
      getPastEvents: getPastEventsBlockChainMock,
      options: {
        address: '0xsmartAssetContract'
      }
    };
  };
  describe('urlFactory', () => {
    let instance:GetPastEventService;
    beforeEach(() => {
      instance = new GetPastEventService({
        getInstanceFromAddressOrName: mockgetInstanceFromAddressOrName

      } as any,
              {} as any,
              {
                getBlockChainProxyEndpoint: () => 'http://myendpoint.com/report',
                arianeeConfiguration: {
                  chainId: 77,
                  networkName: 'myNetwork'
                }
              } as any,
              web3Service
      );
    });

    test('should work without parameter filter', () => {
      const expectedValue = 'http://myendpoint.com/report/77/contract/0xsmartAssetContract/MyEvent';

      const value = instance.urlFactory('0xsmartAssetContract',
        'MyEvent'
      );
      expect(value).toBe(expectedValue);
    });
    test('should work with block', () => {
      const expectedValue = 'http://myendpoint.com/report/77/contract/0xsmartAssetContract/MyEvent?toBlock=22&fromBlock=0';
      const value = instance.urlFactory('0xsmartAssetContract',
        'MyEvent', {
          fromBlock: 0,
          toBlock: 22
        }
      );
      expect(value).toBe(expectedValue);
    });
    test('should work with filter', () => {
      const expectedValue = 'http://myendpoint.com/report/77/contract/0xsmartAssetContract/MyEvent?returnValues._tokenId=234&returnValues._otherValue=bliblablou&fromBlock=0';
      const value = instance.urlFactory('0xsmartAssetContract',
        'MyEvent', {
          fromBlock: 0,
          filter: {
            _tokenId: 234,
            _otherValue: 'bliblablou'
          }
        }
      );
      expect(value).toBe(expectedValue);
    });
  });
  describe('getPastEvents', () => {
    let instance:GetPastEventService;
    const mockFetch = jest.fn();
    beforeEach(() => {
      jest.clearAllMocks();
      jest.resetAllMocks();
      mockFetch.mockImplementation(() => Promise.resolve([]));
      getPastEventsBlockChainMock.mockImplementation(() => Promise.resolve([]));
    });
    test('should call proxy', async () => {
      instance = new GetPastEventService({
        getInstanceFromAddressOrName: mockgetInstanceFromAddressOrName
      } as any,
          {
            fetch: mockFetch
          } as any,
          {
            isProxyEnable: () => true,
            getBlockChainProxyEndpoint: () => 'http://myendpoint.com/report',
            arianeeConfiguration: {
              networkName: 'myNetwork',
              chainId: 77,
              blockchainProxy: {
                enable: true
              }
            }
          } as any,
          web3Service
      );
      const expectedValue = 'http://myendpoint.com/report/77/contract/0xsmartAssetContract/MyEvent';

      const value = await instance.getPastEvents(
        ContractName.smartAssetContract,
        'MyEvent'
      );

      expect(value).toEqual([]);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(getPastEventsBlockChainMock).toHaveBeenCalledTimes(0);
    });
    test('should call blockchain', async () => {
      instance = new GetPastEventService({
        getInstanceFromAddressOrName: mockgetInstanceFromAddressOrName
      } as any,
          {
            fetch: mockFetch
          } as any,
          {
            isProxyEnable: () => false,
            getBlockChainProxyEndpoint: () => 'http://myendpoint.com/report',
            arianeeConfiguration: {
              networkName: 'myNetwork',
              chainId: 77,
              blockchainProxy: {
                enable: false
              }
            }
          } as any,
          web3Service
      );
      const expectedValue = 'http://myendpoint.com/report/77/contract/0xsmartAssetContract/MyEvent';

      const value = await instance.getPastEvents(
        ContractName.smartAssetContract,
        'MyEvent'
      );

      expect(value).toEqual([]);
      expect(mockFetch).toHaveBeenCalledTimes(0);
      expect(getPastEventsBlockChainMock).toHaveBeenCalledTimes(1);
    });
  });
});
