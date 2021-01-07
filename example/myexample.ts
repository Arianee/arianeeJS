import { makeWalletReady } from '../features/steps/helpers/walletCreator';
import { Arianee, NETWORK } from '../src';

(async function () {
  const arianee = await new Arianee().init(NETWORK.testnet);

  const wallet = arianee
    .fromMnemonic('sorry bread torch news obey quiz risk crouch quality clean source bunker');

  await wallet.methods.buyCredits('certificate', 1);
  console.log('aria', await wallet.methods.balanceOfAria());

  console.log('ria', await wallet.methods.balanceOfRia());
})();
