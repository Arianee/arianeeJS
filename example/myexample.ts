import { makeWalletReady } from '../features/steps/helpers/walletCreator';
import { Arianee, NETWORK } from '../src';
import { blockchainEventsName } from '../src/models/blockchainEventsName';

(async function () {
  (async function () {
    const arianee = await new Arianee().init(NETWORK.testnet);
    const wallet = arianee.fromRandomKey();
    wallet.setDefaultQuery({ content: false });
      const wallet2 = arianee.fromRandomMnemonic();
     wallet2.globalConfiguration.setDefaultQuery({content: true});

    await new Arianee().init(NETWORK.mainnet);

    // should be 77 and it is 99
    console.log('is working==', wallet.configuration.chainId === 77);
  })();
})();
