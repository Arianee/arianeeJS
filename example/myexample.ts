import { makeWalletReady } from '../features/steps/helpers/walletCreator';
import { NETWORK } from '../src';
import { Arianee } from '../src/core/arianee';

(async function () {
  const arianee = await new Arianee().init(NETWORK.testnet);
  const wallet = arianee.fromPrivateKey('0xd172d239727bff289dafa9824987a4ef9eb2a0fe4bac9988b30a98368d447938');

  console.log(wallet.privateKey);

  console.log(await wallet.methods.ownerOf(837642124));
})();
