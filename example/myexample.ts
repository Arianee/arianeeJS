import { makeWalletReady } from '../features/steps/helpers/walletCreator';
import { Arianee, NETWORK } from '../src';
import { blockchainEventsName } from '../src/models/blockchainEventsName';

(async function () {
  const arianee = await new Arianee().init(NETWORK.testnet);

  const wallet = arianee.fromPrivateKey('0xe6062a7e5a511a119ca3c9a4dabf6f5eec92e31642123133a3920e0c92aaac9e');


  wallet.setCustomSendTransaction(transaction => {
    return Promise.resolve('');
  });

  await wallet.contracts.storeContract.methods.buyCredit(0, 5, wallet.address).send();

  const result = await wallet.methods.createCertificate({
    uri: 'http://localhost:3000/mycertificate.json',
    content: {
      $schema: 'https://cert.arianee.org/version1/ArianeeAsset.json',
      name: 'Arianee',
      v: '0.1'
    }
  });
  console.log('success');
})();
