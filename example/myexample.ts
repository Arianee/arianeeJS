import { Arianee, NETWORK } from '../src';

(async function () {
  const arianee = await new Arianee().init(NETWORK.arianeeTestnet, {
    transactionOptions: {
      gasPrice: 1000000000,
      gas: 1000000000
    }
  });

  const wallet = arianee.fromRandomKey();

  // await wallet.requestAria();
  await wallet.requestAria();
  const b = await wallet.methods.balanceOfAria();
  console.log(b);
  // await wallet.methods.approveStore();
  // await wallet.methods.buyCredits('certificate', 100, wallet.publicKey);

  //  batch.execute();

  /* wallet.web3.eth.sendSignedTransaction(transaction.c)
    .on('transactionHash', console.log)
    .on('confirmation', (confirmationNumber, receipt) => {
      console.log('receipt', receipt);
    })
    .on('error', console.error); */
})();
