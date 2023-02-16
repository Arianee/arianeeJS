import { POAAndAriaService } from './POAAndAriaService';
import { ArianeeHttpClient } from '../../../libs/arianeeHttpClient/arianeeHttpClient';
import { ConfigurationService } from '../configurationService/configurationService';
import { WalletService } from '../walletService/walletService';
import { ArianeeAccessTokenCreatorService } from '../ArianeeAccessToken/arianeeAccessTokenCreatorService';

describe('POAandAriaService', () => {
  const getAllDependencies = () => {
    const ArianeeHttpClient = {
      fetch: jest.fn() as any
    } as ArianeeHttpClient;
    const ConfigurationService = {
      arianeeConfiguration: {
        faucetUrl: 'testfauceturl.com'
      }
    } as ConfigurationService;
    const WalletService = {
      account: { address: '0x000000000000000000000000000000000' }
    } as WalletService;
    const ArianeeAccessTokenCreatorService = {
      createWalletAccessToken: jest.fn().mockReturnValue('AAT') as any
    } as ArianeeAccessTokenCreatorService;

    return {
      ArianeeHttpClient,
      ConfigurationService,
      WalletService,
      ArianeeAccessTokenCreatorService
    };
  };

  test('should throw if there is an error with httpfetch', async () => {
    const {
      ArianeeHttpClient,
      ConfigurationService,
      WalletService,
      ArianeeAccessTokenCreatorService
    } = getAllDependencies();

    ArianeeHttpClient.fetch = jest.fn().mockReturnValue(Promise.reject());
    const instance = new POAAndAriaService(ArianeeHttpClient, ConfigurationService, WalletService);
    try {
      await instance.requestPoa();
      expect(true).toBe(false);
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
