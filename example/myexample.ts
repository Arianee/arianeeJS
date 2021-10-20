import assert from 'assert';
import { Arianee, NETWORK } from '../src';
import web3 from 'web3';

(async function () {
  const arianee = await new Arianee().init(NETWORK.testnet);
})();
