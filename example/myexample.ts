import assert from 'assert';
import { Arianee, NETWORK } from '../src';
import web3 from 'web3';
import { makeWalletReady } from '../features/steps/helpers/walletCreator';

(async function () {
  const arianee = await new Arianee().init(NETWORK.testnet);
  const wallet = arianee.fromPrivateKey('0x510701c5f68e96bc5ac843be8951bc24d93c001673ac94a9df2c5ffd783ea4c0');

  /**
   *     certificateId: 789511572,
   passphrase: 'fpf91aihd7hv',

   */
  const certificateId='789511572';

  console.log(await wallet.methods.isMissing(certificateId));
  await wallet.methods.setMissingStatus(certificateId);
  console.log(await wallet.methods.isMissing(certificateId));
  await wallet.methods.unsetMissingStatus(certificateId);
  console.log(await wallet.methods.isMissing(certificateId));
})();
