import { makeWalletReady } from '../features/steps/helpers/walletCreator';
import { Arianee, NETWORK } from '../src';
import { blockchainEventsName } from '../src/models/blockchainEventsName';

(async function () {
  (async function () {
    const arianee = await new Arianee().init(NETWORK.testnet);
    const wallet = arianee.fromPrivateKey('0x14a99f4c1f00982e9f3762c9abaf88b30e9f3e6bb8b89bc99ecb76e1cd7a6538');

    const i = await wallet.methods.createActionProofLink('http://localhost:4200', 2476541, 'em2iomuvn48c');
    const d = await wallet.methods.isCertificateProofValidFromActionProofLink('http://localhost:4200\'');
    console.log(d);
  })();
})();
