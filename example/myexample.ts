import { makeWalletReady } from '../features/steps/helpers/walletCreator';
import { Arianee, NETWORK } from '../src';
import { HttpInterceptor, HttpRequestInterceptor } from '../src/models/httpClient';

(async function () {
  const httpInterceptor: HttpRequestInterceptor = (url, config) => {
    return Promise.resolve({ url, config });
  };

  const arianee = await new Arianee().init(NETWORK.testnet, {
    httpInterceptor: {
      httpRequestInterceptor: httpInterceptor
    }
  });

  const wallet = arianee
    .fromMnemonic('sorry bread torch news obey quiz risk crouch quality clean source bunker');

  wallet.methods.getCertificate(33314649, '8xb2t0kvxz0w', { content: true });
})();
