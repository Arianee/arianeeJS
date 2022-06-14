import {Arianee, NETWORK} from '../src';

(async function () {
  const arianee = await new Arianee().init(NETWORK.mainnet, {
    blockchainProxy: {
      enable: true,
      host: 'https://arianee-api-backend-prod-v22b54liiq-ew.a.run.app/report'
    }
  });

  const wallet = arianee.fromMnemonic('tell bottom casual hobby announce garbage marble envelope slide stove please manual');
//0xa0d8170431df8a8b665c7ed1c6dd85672a4ca29dbb55248e0066adf0c9f4fdd9
  const d = await wallet.methods.getIdentity('0x621C2a125ec4A6D8A7C7A655A18a2868d35eb43C');
  console.log(d);
})();
