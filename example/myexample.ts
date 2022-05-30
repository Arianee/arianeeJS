import {Arianee, NETWORK} from '../src';

(async function () {
  const arianee = await new Arianee().init(NETWORK.testnet, {
    blockchainProxy: {
      enable: false,
      host: 'https://arianee-api-backend-dev-v22b54liiq-ew.a.run.app/report'
    }
  });

  const wallet = arianee.fromMnemonic('tell bottom casual hobby announce garbage marble envelope slide stove please manual');

  console.log(wallet.address.toLowerCase());

  const b = await wallet.methods.getCertificate(98275016, 'v2hcw14x7pgs', {
    events: true
  });
  console.log(b.events.transfer[0].timestamp);
  console.log(1653644920);
  // console.log(r);
})();
