import { makeWalletReady } from '../features/steps/helpers/walletCreator';
import { Arianee, NETWORK } from '../src';
import { blockchainEventsName } from '../src/models/blockchainEventsName';

(async function () {
  const arianee = await new Arianee().init(NETWORK.testnet);

  const wallet = arianee.fromPrivateKey('0xe6062a7e5a511a119ca3c9a4dabf6f5eec92e31642123133a3920e0c92aaac9e');
  console.log('pub', wallet.address);

  // await wallet.methods.requestPoa();
  // await wallet.methods.requestCertificateOwnership(966010, 'jeoapndigorndi');
})();
