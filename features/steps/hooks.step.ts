import { AfterAll, Before, BeforeAll, setDefaultTimeout } from 'cucumber';
import { NETWORK } from '../../src';
import { Arianee } from '../../src/core/arianee';
import { CCStore } from './helpers/store';

setDefaultTimeout(30 * 1000);

let singletonArianee;
BeforeAll(async () => {
  const network = <NETWORK>process.env.NETWORK || NETWORK.arianeeTestnet;
  singletonArianee = await new Arianee().init(network);
  console.log(`ALL E2E TESTS ARE RUN ON:${network}`);
});

Before(function () {
  this.store = new CCStore();
  this.walletFactory = () => singletonArianee;
});
