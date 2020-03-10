import appConfigurations from '../../configurations/appConfigurations';
import { TransactionOptions } from '../../models/arianeeConfiguration';
import { NETWORK, networkURL } from '../../models/networkConfiguration';
import { Arianee } from './arianee';

const myFetchMock = jest.fn();

const httpMock = {
  contractAdresses: {
    aria: '0xB81AFe27c103bcd42f4026CF719AF6D802928765',
    creditHistory: '0x9C868D9bf85CA649f219204D16d99A240cB1F011',
    eventArianee: '0x8e8de8fe625c376f6d4fb2fc351337268a73388b',
    identity: '0x74a13bF9eFcD1845E5A2e932849094585AA3BCF9',
    smartAsset: '0x512C1FCF401133680f373a386F3f752b98070BC5',
    staking: '0x3a125be5bb8a3e1c171947c384795b4a488b74a0',
    store: '0x4f001a00034e0d823c30819166dea654cd8b1939',
    whitelist: '0x3579669219DC20Aa79E74eEFD5fB2EcB0CE5fE0D'
  },
  httpProvider: 'https://sokol.poa.network',
  chainId: 77
};
jest.mock('../libs/arianeeHttpClient/arianeeHttpClient', () => ({
  ArianeeHttpClient: class ArianeeHttpClientStub {
        public fetch = ArianeeHttpClientStub.fetch;

        public static fetch = url => {
          myFetchMock(url);
          return Promise.resolve(httpMock);
        };
  }
}));

describe('Arianee', () => {
  describe('globalConfiguration', () => {
    test('should be set configuration', async () => {
      const requestConfig = { content: true };
      const arianee = await new Arianee()
        .setDefaultQuery(requestConfig)
        .init();

      expect(arianee.fromRandomKey().globalConfiguration.defaultQuery).toEqual(requestConfig);
    });
  });
  describe('Network Configuration', () => {
    describe('testnet', () => {
      test('should be fetching testnet addresses', async () => {
        await new Arianee().init(NETWORK.testnet);
        expect(myFetchMock).toHaveBeenCalledWith(networkURL.testnet);
      });
      test('should be fetching testnet config', async () => {
        const arianee = await new Arianee().init(NETWORK.testnet);
        const {
          deepLink,
          faucetUrl
        } = arianee.fromRandomKey().configuration;

        expect(deepLink).toBe(appConfigurations.testnet.deepLink);
        expect(faucetUrl).toBe(appConfigurations.testnet.faucetUrl);
      });
    });

    describe('mainet', () => {
      test('should be fetching testnet addresses', async () => {
        await new Arianee().init(NETWORK.mainnet);
        expect(myFetchMock).toHaveBeenCalledWith(networkURL.mainnet);
      });

      test('should be fetching testnet config', async () => {
        const arianee = await new Arianee().init(NETWORK.mainnet);
        const {
          deepLink,
          faucetUrl
        } = arianee.fromRandomKey().configuration;
        expect(deepLink).toBe(appConfigurations.mainnet.deepLink);
        expect(faucetUrl).toBe(appConfigurations.mainnet.faucetUrl);
      });
    });
  });
  describe('brandDataHubReward walletReward', () => {
    test('should have a default setting', async () => {
      const arianee = await new Arianee()
        .init(NETWORK.testnet);

      const wallet = arianee.fromRandomKey();
      expect(wallet.configuration.brandDataHubReward.address).toBeDefined();
      expect(wallet.configuration.walletReward.address).toBeDefined();
    });

    test('should be setting custom brandDataHubReward', async () => {
      const brandDataHubReward = { address: '0x640D422Af7a6e9A21adC919b5909ED745ABED58' };
      const arianee = await new Arianee()
        .init(NETWORK.testnet, { brandDataHubReward });

      const wallet = arianee.fromRandomKey();
      expect(wallet.configuration.brandDataHubReward).toEqual(brandDataHubReward);
    });

    test('should be setting custom walletReward', async () => {
      const walletReward = { address: '0x640D422Af7a6e9A21adC919b59609ED745ABED58' };
      const arianee = await new Arianee()
        .init(NETWORK.testnet, { walletReward });

      const wallet = arianee.fromRandomKey();
      expect(wallet.configuration.walletReward).toEqual(walletReward);
    });
  });

  describe('transactionOptions', () => {
    test('should have a default setting 1111', async () => {
      const arianee = await new Arianee()
        .init(NETWORK.testnet);

      const wallet = arianee.fromRandomKey();
      expect(wallet.configuration.transactionOptions).toBeDefined();
      expect(wallet.configuration.transactionOptions.gas).toBeDefined();
      expect(wallet.configuration.transactionOptions.gasPrice).toBeDefined();
    });

    test('should be setting custom transactionOptions', async () => {
      const transactionOptions:TransactionOptions = { gasPrice: 2, gas: 1 };
      const arianee = await new Arianee()
        .init(NETWORK.testnet, { transactionOptions });

      const wallet = arianee.fromRandomKey();
      expect(wallet.configuration.transactionOptions).toEqual(transactionOptions);
    });
  });

  describe('Custom web3Provider', () => {
    test('should have a default setting', async () => {
      const myCustomHttpProvider = 'https://monhttpProvider.com';

      const arianee = await new Arianee()
        .init(NETWORK.testnet, { httpProvider: myCustomHttpProvider });

      const wallet = arianee.fromRandomKey();
      expect(wallet.configuration.web3Provider).toBe(myCustomHttpProvider);
    });
  });

  describe('should output same wallet public key for each arianeeJS version', () => {
    describe('with a same mnemonic', () => {
      const mnemonic = 'hire super odor text avocado detail remain air end live sauce wife';
      const privateKey = '0x048f9038e7c38c225d8e98078bd8a28923a13a9c255190975258afebd56506d3';
      const publicKey = '0x640D422Af7a6e9A21adC919b59609ED745ABED58';

      test('should be same public key fromMnemonic', async () => {
        const arianee = await new Arianee().init(NETWORK.testnet);
        const wallet = arianee.fromMnemonic(mnemonic);
        expect(wallet.privateKey).toBe(privateKey);
        expect(wallet.publicKey).toBe(publicKey);
      });

      test('should be same public key fromPrivateKey', async () => {
        const arianee = await new Arianee().init(NETWORK.testnet);
        const wallet = arianee.fromPrivateKey(privateKey);
        expect(wallet.publicKey).toBe(publicKey);
        expect(wallet.privateKey).toBe(privateKey);
      });
    });

    describe('from passphrase', () => {
      const passphrase = 'passphrase';
      const publicKey = '0x8E7a86D892d88BA42C780ce7E557B0EbbcFDC650';
      const privateKey = '0x0000000000000000000000000000000000000000000070617373706872617365';

      test('should be same public key fromPrivateKey', async () => {
        const arianee = await new Arianee().init(NETWORK.testnet);
        const wallet = arianee.fromPassPhrase(passphrase);
        expect(wallet.publicKey).toBe(publicKey);
        expect(wallet.privateKey).toBe(privateKey);
      });
    });
  });

  describe('What is a valid private key', () => {
    describe('from passphrase', () => {
      test('should be accepted private key', async (done) => {
        const privateKey = '0x0000000000000000000000000000000000000000000070617373706872617365';
        const arianee = await new Arianee().init(NETWORK.testnet);
        try {
          arianee.fromPrivateKey(privateKey);
          done();
        } catch (e) {
          expect(false).toBeTruthy();
        }
      });

      test('should be not accepted private key if not oX', async (done) => {
        const privateKey = '0000000000000000000000000000000000000000000070617373706872617365';
        const arianee = await new Arianee().init(NETWORK.testnet);
        try {
          arianee.fromPrivateKey(privateKey);
        } catch (e) {
          done();
        }
      });
      test('should be not accepted private key if not 64/66 chars', async (done) => {
        const privateKey = '0x0000000000000070617373706872617365';
        const arianee = await new Arianee().init(NETWORK.testnet);
        try {
          arianee.fromPrivateKey(privateKey);
        } catch (e) {
          console.log('here');
          done();
        }
      });
    });
  });
});
