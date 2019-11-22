import { makeWalletReady } from '../features/steps/helpers/walletCreator';
import { Arianee, NETWORK } from '../src';
import { aria } from '../src/configurations';
import {waitFor} from "../features/steps/helpers/waitFor";

const fs = require('fs');

var fetch = require('node-fetch-polyfill');

(async function () {
  const arianee = await new Arianee().init(NETWORK.testnet);

  const wallet1 = arianee.fromPrivateKey('0xe7cfc290a5b9f5ad89978fa91eac0af0ca05eaa478c77735e13cf493cab40855');
  const wallet2 = arianee.fromMnemonic('roof stick equip flock grit need pony lazy cable sleep mosquito year');
  const wallet3 = arianee.fromRandomKey();


  console.log("here")

    wallet1.watch.on('TransferFrom',(data)=>{
    console.log('data');
  })

  await wallet1.contracts.smartAssetContract.methods.transferFrom(wallet1.publicKey, wallet2.publicKey, 8964972).send();
  await wallet2.contracts.smartAssetContract.methods.transferFrom(wallet2.publicKey, wallet1.publicKey, 8964972).send();



  await waitFor(10000)
})();
