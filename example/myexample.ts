import { Arianee, NETWORK } from '../src';

(async function () {
  const arianee = await new Arianee().init(NETWORK.testnet, {
    blockchainProxy: {
      enable: true,
      host: 'https://arianee-api-backend-dev-v22b54liiq-ew.a.run.app/report'
    }
  });

  const wallet = arianee.fromMnemonic('tell bottom casual hobby announce garbage marble envelope slide stove please manual');

  console.log(wallet.address.toLowerCase());
  const r = await wallet.methods.getMyMessages();

  console.log(r);
  // console.log(r);
})();
