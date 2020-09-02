import { waitFor } from '../features/steps/helpers/waitFor';
import { makeWalletReady } from '../features/steps/helpers/walletCreator';
import { Arianee, NETWORK } from '../src';
import { blockchainEventsName } from '../src/models/blockchainEventsName';

(async function () {
  const arianee = await new Arianee().init(NETWORK.testnet);
  const wallet = arianee.fromPrivateKey('0x6c2504d31d9c51e24e23048c80f1b83cdf8c491fce77d5f193d3d906ab60cd2b');

  // await wallet.methods.requestCertificateOwnership(477240924, 'bp9ksfnv7e2c');

  // const d = await wallet.methods.getCertificate(477240924, 'bp9ksfnv7e2c', { owner: true });

  // https://test.arian.ee/477240924,
  /*
  const messages = await wallet.methods.getMyMessages();
  messages.map(d => {
    console.log(d.messageId);
    console.log(d.content.data);
  });
*/
  const messages = await wallet.methods.getMessage({ messageId: 274101524, query: { advanced: { languages: ['fr'] } } });

  console.log(messages.content.data);
  /*
  await wallet
    .arianeeMethods
    .arianeeEvent
    .accept({ eventId: '123' });

  await wallet
    .arianeeMethods
    .arianeeEvent
    .accept('123');

  wallet
    .arianeeMethods
    .certificate
    .fetch
    .one({
      certificateId: 123
    });

  wallet
    .arianeeMethods
    .certificate
    .fetch
    .one(123, 'zfezef');
*/

  // https://www.monbdh.com/api/arian/balance

  /* fetch('https://www.monbdh.com/api/certificate/fetch/one',{
        certificateId: 31136419,
        query: {owner: true}
})
*/

  // https://www.monbdh.com/api/dMessage/creation/createAndStore

  /* fetch('https://www.monbdh.com/api/certificate/creation/create',{
      uri: 'http://localhost:3000/mycertificate.json',
      content: {
        $schema: 'https://cert.arianee.org/version1/ArianeeAsset.json',
        name: 'Arianee'
      }
    })
*/

  /* fetch('https://www.monbdh.com/api/certificate/creation/storeContent',{
    uri: 'http://localhost:3000/mycertificate.json',
    content: {
      $schema: 'https://cert.arianee.org/version1/ArianeeAsset.json',
      name: 'Arianee'
    }
  })
*/

  /*
    const result = await wallet.methods.createCertificate({
      uri: 'http://localhost:3000/mycertificate.json',
      content: {
        $schema: 'https://cert.arianee.org/version1/ArianeeAsset.json',
        name: 'Arianee'
      }
    });

    const cert = result.certificateId;
    wallet.watch.on('TransferTo', () => {
      console.log('transferTo1');
    });
    wallet.watch.removeAllListeners('TransferTo');

    await waitFor(3000);

    wallet.watch.on('TransferTo', () => {
      console.log('transferTo2');
    });

    console.log(0);
    const link = await wallet.methods.createCertificateRequestOwnershipLink(cert);
    console.log(1);
    await wallet2.methods.requestCertificateOwnership(link.certificateId, link.passphrase);
    console.log(2);

    const link2 = await wallet2.methods.createCertificateRequestOwnershipLink(cert);
    console.log(3);
    await wallet.methods.requestCertificateOwnership(link2.certificateId, link2.passphrase);
    console.log(4); */
})();
