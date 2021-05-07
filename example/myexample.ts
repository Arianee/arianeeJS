import { NETWORK } from '../src';
import { Arianee } from '../src/core/arianee';

(async function () {
  const arianee = await new Arianee().init(NETWORK.mumbai);
  const wallet = arianee.fromRandomMnemonic();

  console.log(await wallet.methods.balanceOfPoa());
  console.log(await wallet.methods.balanceOfAria());

  await wallet.requestAria();
  console.log(await wallet.methods.balanceOfPoa());
  console.log(await wallet.methods.balanceOfAria());
})();
