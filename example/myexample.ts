import { waitFor } from '../features/steps/helpers/waitFor';
import { makeWalletReady } from '../features/steps/helpers/walletCreator';
import { Arianee, NETWORK } from '../src';
import { blockchainEventsName } from '../src/models/blockchainEventsName';

(async function () {
  const arianee = await new Arianee().init(NETWORK.testnet);
  const wallet = arianee.fromPrivateKey('0x6c2504d31d9c51e24e23048c80f1b83cdf8c491fce77d5f193d3d906ab60cd2b');

  // const messages = await wallet.methods.getMyMessages();

  // const b = await wallet.methods.getMessage({ messageId: 6212570 });
  const d = await wallet.methods.isMessageRead(6212570);
  console.log(d);
  await wallet.methods.markAsRead(6212570)
  const c = await wallet.methods.isMessageRead(6212570);
  console.log(c);
  // console.log(messages);
})();
