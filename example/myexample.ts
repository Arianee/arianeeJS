import { makeWalletReady } from '../features/steps/helpers/walletCreator';
import { Arianee, NETWORK } from '../src';
import { blockchainEventsName } from '../src/models/blockchainEventsName';

(async function () {
  const arianee = await new Arianee().init(NETWORK.mainnet);

  const wallet = arianee.fromRandomKey();

  const d = await wallet.contracts.smartAssetContract.methods.ownerOf(2275206).call();
  console.log(d);
})();
