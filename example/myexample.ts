import { waitFor } from '../features/steps/helpers/waitFor';
import { NETWORK } from '../src';
import { Arianee } from '../src/core/arianee';
import axios from 'axios';
import { PromiEvent, TransactionReceipt } from 'web3-core';

(async function () {
  const arianee = await new Arianee().init(NETWORK.testnet);

  console.log(arianee.fromRandomMnemonic().utils
    .readLink('https://www.egzeg.com/83215087,tp0f6vnuijc0', false));
})();
