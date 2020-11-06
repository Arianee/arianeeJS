import { waitFor } from '../features/steps/helpers/waitFor';
import { makeWalletReady } from '../features/steps/helpers/walletCreator';
import { Arianee, NETWORK } from '../src';
import { blockchainEventsName } from '../src/models/blockchainEventsName';

(async function () {
  const arianee = await new Arianee().init(NETWORK.testnet);
  const wallet = arianee.fromMnemonic('foot badge oblige step aim boss seed banana congress require angle solution');

  const content = {
    content: {
      $schema: 'https://cert.arianee.org/version1/ArianeeAsset.json',
      name: 'Arianee 0',
      v: '0.1',
      serialnumber: [{ type: 'serialnumber', value: 'SAMPLE' }]
    }
  };

  const certificateId = 249916428;
  const passphrase = '4cydocq78443';

  await wallet.methods.storeContentInRPCServer(certificateId, content.content, 'http://localhost:3000/rpc');

  const newContent = {
    $schema: 'https://cert.arianee.org/version1/ArianeeAsset.json',
    name: 'Arianee 4',
    v: '0.1',
    serialnumber: [{ type: 'serialnumber', value: 'SAMPLE' }]
  };

  await wallet.methods.updateAndStoreCertificate(
    { certificateId, content: newContent },
    'http://localhost:3000/rpc')


  const result = await wallet.methods.getCertificate(certificateId, passphrase, {
    content: true,
    issuer: {
      rpcURI: 'http://localhost:3000/rpc'
    }
  });


})();
