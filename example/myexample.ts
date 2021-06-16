import { waitFor } from '../features/steps/helpers/waitFor';
import { NETWORK } from '../src';
import { Arianee } from '../src/core/arianee';
import axios from 'axios';
import { PromiEvent, TransactionReceipt } from 'web3-core';

(async function () {
  const arianee = await new Arianee().init(NETWORK.testnet);

  const wallet = arianee.fromRandomKey();

  const currConfiguration = wallet.globalConfiguration.defaultQuery;

  currConfiguration.advanced = {
    languages: ['fr']
  };

  wallet.globalConfiguration.setDefaultQuery(currConfiguration);

  const cert = await wallet.methods.getCertificate(53572563,"ndj2j3sw9wec")
  console.log(cert.issuer.identity.data);
  // gas: 2000000,
  //   gasPrice: 1000000000
  //const wallet = arianee.fromPrivateKey("0xc3dbb45130930235004ec0aae717b0cc0bb45d805526e03c8ec75e5779c12c3a")

  //const tx =  await wallet.contracts.ariaContract.methods.transfer("0xE6F99382e4217F09A3059054a78f6D04De33A802", 10000000).send();
  //console.log(tx);


  /*await wallet.methods.cancelTransactions(
    {
      fromNonce: 0
    });*/
/*
const wallet = arianee.fromPrivateKey("0x9da40ddcd3746cb49c780b9fada3319c349ddf489b175464115cce9782d4a47a");
    console.log('canceling');
    await wallet.methods.cancelTransactions(
      {
        fromNonce: 5436,
        gasPrice:15000000000
      });
    console.log('finished');*/



})();
