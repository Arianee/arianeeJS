import {Arianee, NETWORK} from '../src';

(async function () {
  const arianee = await new Arianee().init(NETWORK.testnet, {
    blockchainProxy: {
      enable: false,
      host: 'http://localhost:8080/report'
    }
  });

  const wallet = arianee.fromMnemonic('tell bottom casual hobby announce garbage marble envelope slide stove please manual');

  console.log(wallet.address.toLowerCase());
  //console.log(await wallet.methods.ownerOf(3625080));
  const r = await wallet.methods.getMyCertificates();
  console.log(r.map(d => d.certificateId));



  // console.log(r);
})();
