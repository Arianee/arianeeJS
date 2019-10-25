import {makeWalletReady} from "../features/steps/helpers/walletCreator";
import {Arianee, NETWORK} from "../src";

const fs = require('fs');

var fetch = require("node-fetch-polyfill");

(async function () {
  const arianee = await new Arianee().init(NETWORK.testnet);

  const wallet = arianee.fromPrivateKey('0xe7318dfc88432487ab853575d1a048c36da158fd9b409aaa8d023fe3464ac90a');
  // await makeWalletReady(wallet);

  const certificates = await wallet.methods.getMyCertificates();
  //fs.writeFileSync('./acertificate.json', JSON.stringify(certificates));
  console.log(JSON.stringify(certificates));
})();
