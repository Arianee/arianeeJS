import { Arianee, NETWORK } from '../src';

(async function () {
  const arianee = await new Arianee().init(NETWORK.testnet);

  const wallet = arianee
    .fromMnemonic('sorry bread torch news obey quiz risk crouch quality clean source bunker');
})();
