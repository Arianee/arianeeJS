import { Arianee, NETWORK } from '../src';
import { makeWalletReady } from '../features/steps/helpers/walletCreator';

(async function () {
  const arianee = await new Arianee().init(NETWORK.testnet);
  const wallet = arianee.fromPrivateKey('0x510701c5f68e96bc5ac843be8951bc24d93c001673ac94a9df2c5ffd783ea4c0');
  // https://poa.iwc.com/35289079,wy8se9xjvyyi

  const d = await wallet.methods.getCertificateFromLink('https://test.arian.ee/35289079,wy8se9xjvyyi');
  console.log(d.content.data);
})();
