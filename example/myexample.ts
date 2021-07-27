import assert from 'assert';
import { Arianee, NETWORK } from '../src';

(async function () {
  const arianee = await new Arianee().init(NETWORK.testnet, {
    gasStation: 'https://gasstation-mainnet.matic.network/'
  });

  const wallet = await arianee.fromMnemonic('tomorrow bomb dice toe stock save crush narrow name then document trigger');

  wallet.methods.approveStore();
})();
