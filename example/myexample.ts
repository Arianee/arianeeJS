import { makeWalletReady } from '../features/steps/helpers/walletCreator';
import { Arianee, NETWORK } from '../src';
import { blockchainEventsName } from '../src/models/blockchainEventsName';

(async function () {
  const arianee = await new Arianee().init(NETWORK.testnet);

  const wallet = arianee.fromMnemonic('autumn balcony range return enact educate firm glare then pool round message');

  const res = {
    certificateId: 9818467,
    passphrase: 'u948df0ohef0'
  };

  let isLost = await wallet.contracts.lostContract.methods.isLost(9818467).call();
  console.log(isLost);

  await wallet.contracts.lostContract.methods.setLost(9818467)
    .send();
  isLost = await wallet.contracts.lostContract.methods.isLost(9818467).call();
  console.log(isLost);

  await wallet.contracts.lostContract.methods.unsetLost(9818467)
    .send();

  isLost = await wallet.contracts.lostContract.methods.isLost(9818467).call();
  console.log(isLost);
})();
