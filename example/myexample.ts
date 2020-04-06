import { makeWalletReady } from '../features/steps/helpers/walletCreator';
import { Arianee, NETWORK } from '../src';
import { blockchainEventsName } from '../src/models/blockchainEventsName';

(async function () {
  const arianee = await new Arianee().init(NETWORK.arianeeTestnet);

  const wallet = arianee.fromRandomKey();

  await wallet.methods.approveStore();

  wallet.methods.createCertificate({
    content: {
      $schema: 'https://cert.arianee.org/version1/ArianeeAsset.json',
      name: 'Arianee'
    }
  })
    .then(i => console.log('sucess', i))
    .catch(d => console.log('errror', d));
})();
