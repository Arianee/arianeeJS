import { waitFor } from '../features/steps/helpers/waitFor';
import { makeWalletReady } from '../features/steps/helpers/walletCreator';
import { Arianee, NETWORK } from '../src';
import { blockchainEventsName } from '../src/models/blockchainEventsName';

(async function () {
  const arianee = await new Arianee().init(NETWORK.testnet);
  const wallet = arianee.fromMnemonic('roof stick equip flock grit need pony lazy cable sleep mosquito year');
  // await wallet.methods.requestCertificateOwnership(83190887, 'tu4x6d28h8fe');

  console.log(await wallet.methods.getIdentity('0x57F5111A7e997a7Ba63CC8976C92decbd86C1B08', { waitingIdentity: true }));
})();
