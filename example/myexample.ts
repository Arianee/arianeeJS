import {makeWalletReady} from "../features/steps/helpers/walletCreator";
import {Arianee, NETWORK} from "../src";
import {aria} from "../src/configurations";

const fs = require('fs');

var fetch = require("node-fetch-polyfill");

(async function () {
    const arianee = await new Arianee().init(NETWORK.testnet);

    const wallet1 = arianee.fromMnemonic('piano sort cash token advice label utility orchard stone arctic two rose');
    const certificates = await wallet1.methods.getCertificate(74908, undefined, {arianeeEvents:true});
console.log(certificates.events.arianeeEvents[3]);

})();
