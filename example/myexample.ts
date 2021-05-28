import { makeWalletReady } from '../features/steps/helpers/walletCreator';
import { NETWORK } from '../src';
import { Arianee } from '../src/core/arianee';

(async function () {
  const arianee = await new Arianee().init(NETWORK.testnet, {
    defaultArianeePrivacyGateway: 'https://zfezefrianee.com/rpc'
  });

  const wallet = arianee.fromPrivateKey('0xb1c7ff3bb6067200c1e1843e474db01c29de26ecb497278354923b12d7dad8d3');

  const ed = {
    certificateId: 446203579,
    passphrase: 'gdptvumu6a46'
  };

  await wallet.methods.createAndStoreMessage({
    content: {
      $schema: 'https://cert.arianee.org/version1/ArianeeEvent-i18n.json',
      eventType: 'service',
      language: 'fr-FR',
      title: 'zefzefez',
      description: 'zefzefez'
    },

    certificateId: ed.certificateId
  });
})();
