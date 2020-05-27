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
  describe('override send', () => {
    test('should use override send', async () => {
      const requestConfig = { content: true };
      const arianee = await new Arianee().init();

      const wallet = arianee.fromRandomMnemonic();

      const customSend = jest.fn().mockImplementation(() => Promise.resolve());
      wallet.setCustomSendTransaction(customSend);

      await wallet.methods.approveStore();

      expect(customSend).toHaveBeenCalled();
    });
  });
});
