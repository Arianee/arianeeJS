import {makeWalletReady} from "../features/steps/helpers/walletCreator";
import {Arianee, NETWORK} from "../src";
import {aria} from "../src/configurations";

const fs = require('fs');

var fetch = require("node-fetch-polyfill");

(async function () {
    const arianee = await new Arianee().init(NETWORK.testnet);

    const wallet1 = arianee.fromPrivateKey('0xe7cfc290a5b9f5ad89978fa91eac0af0ca05eaa478c77735e13cf493cab40855');
    const certificates = await wallet1.methods.getMyCertificates({content: true});
})();
