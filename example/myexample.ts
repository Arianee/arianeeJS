import {Arianee, NETWORK} from '../src';

(async function () {
  const arianee = await new Arianee().init(NETWORK.testnet, {
    blockchainProxy: {
      enable: true,
      host: 'http://localhost:8080/report'
    }
  });

  const wallet = arianee.fromMnemonic('tell bottom casual hobby announce garbage marble envelope slide stove please manual');

  const r = await
  wallet.methods.getCertificate(
    '9600',
    undefined, { events: true });

  console.log(r.events.transfer.length);
  console.log(r.events.transfer[0]);
})();
