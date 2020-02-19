import { Arianee, NETWORK } from '../src';
import { hydrateTokenParameters } from '../src/models/transaction-parameters';

(async function () {
  const arianee = await new Arianee().init(NETWORK.testnet);

  const wallet = arianee.fromMnemonic('protect tone helmet similar author enemy muffin suspect problem poet exit giraffe sample cave snap');
  // await wallet.requestAria();
  // await wallet.requestPoa();
  // await wallet.methods.approveStore();
  // await wallet.methods.buyCredits('certificate', 100, wallet.publicKey);
  console.log('public key', wallet.publicKey);

  // const transaction = await wallet.contracts.storeContract.methods.reserveToken(init, wallet.publicKey).send();

  // console.log(transaction);
  // const actualNonce = await wallet.web3.eth.getTransactionCount(wallet.publicKey);

  //  console.log('nonce', actualNonce);

  // const nbReservation = 2;
  // const transactionINIT = await wallet.contracts.storeContract.methods.reserveToken(init, wallet.publicKey);

  const content = { $schema: 'https://cert.arianee.org/version1/ArianeeAsset.json', name: 'Maxime certificate 11', v: '0.1', brand: 'TARDIS corp', model: 'tardis', description: 'Tardis blueprint', type: 'SmartAsset', brandLogoHeader: 'https://s1.qwant.com/thumbr/0x380/8/f/a352f47cd6edf762df3d1c431e1ed77932215efb7d3b74d63a9c393a5906a7/novo-logo-doctor-who-jodie-whittaker-doctor-who-brasil-02-1024x1024.jpg?u=http%3A%2F%2Fdoctorwhobrasil.com.br%2Fwp-content%2Fuploads%2F2018%2F02%2Fnovo-logo-doctor-who-jodie-whittaker-doctor-who-brasil-02-1024x1024.jpg&q=0&b=1&p=0&a=1', picture: 'https://s1.qwant.com/thumbr/0x380/9/f/af8129ce7e1969e9ccc5458e9a47519102da29c2452083c4170a42a99a3870/type40tardis_newthumb.png?u=https%3A%2F%2Fd3qdvvkm3r2z1i.cloudfront.net%2Fmedia%2Fcatalog%2Fproduct%2Fcache%2F1%2Fthumbnail%2F85e4522595efc69f496374d01ef2bf13%2Ft%2Fy%2Ftype40tardis_newthumb.png&q=0&b=1&p=0&a=1' };
  const nbCert = 50;
  const input:hydrateTokenParameters[] = [];
  for (let i = 0; i < nbCert; i++) {
    input.push({
      uri: '',
      content: content
    });
  }

  //  const batch = wallet.methods.createCertificateBatch(input);

  console.log('END');

  //  batch.execute();

  /* wallet.web3.eth.sendSignedTransaction(transaction.c)
    .on('transactionHash', console.log)
    .on('confirmation', (confirmationNumber, receipt) => {
      console.log('receipt', receipt);
    })
    .on('error', console.error); */
})();
