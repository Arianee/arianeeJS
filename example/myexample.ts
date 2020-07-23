import { waitFor } from '../features/steps/helpers/waitFor';
import { makeWalletReady } from '../features/steps/helpers/walletCreator';
import { Arianee, NETWORK } from '../src';
import { blockchainEventsName } from '../src/models/blockchainEventsName';

(async function () {
  const arianee = await new Arianee().init(NETWORK.testnet);
  const wallet = arianee.fromPrivateKey('0x6c2504d31d9c51e24e23048c80f1b83cdf8c491fce77d5f193d3d906ab60cd2b');

  const wallet2 = arianee.fromPrivateKey('0x068c8d3160ab989a9f9d80a3722282f1d51ddf6af28b00a918687230e82290c4');

  wallet.watch.on('TransferTo', () => {
    console.log('transferTo1');
  });

  wallet.watch.on('TransferFrom', () => {
    console.log('transferTo1');
  });

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
