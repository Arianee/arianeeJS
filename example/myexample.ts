import {Arianee, NETWORK} from '../src';

(async function () {
  const arianee = await new Arianee().init(NETWORK.mainnet, {
    blockchainProxy: {
      enable: true,
      host: 'https://arianee-api-backend-prod-v22b54liiq-ew.a.run.app/report'
    }
  });
  const wallet = arianee.fromMnemonic('tell bottom casual hobby announce garbage marble envelope slide stove please manual');

  wallet.setCustomSendTransaction(async (transaction,data) => {
    console.log("transaction", transaction);
    console.log("data", data);

  })

await  wallet.methods.createCertificate({
  uri: 'http://localhost:3000/mycertificate.json',
  content: {
    $schema: 'https://cert.arianee.org/version1/ArianeeAsset.json',
    name: 'Arianee',
    v: '0.1',
    serialnumber: [{ type: 'serialnumber', value: 'SAMPLE' }],
    brand: 'Arianee',
    model: 'Token goody',
    description:
        'Here is the digital passport of your Arianee token goody, giving you a glimpse of an augmented ownership experience. This Smart-Asset has a unique ID. It is transferable and enables future groundbreaking features. \n Connect with the arianee team to learn more.',
    type: 'SmartAsset',
    picture:
        'https://www.arianee.org/wp-content/uploads/2019/02/Screen-Shot-2019-02-27-at-12.12.53-PM.png',
    pictures: [
      {
        src:
            'https://www.arianee.org/wp-content/uploads/2019/02/Screen-Shot-2019-02-27-at-12.14.36-PM.png'
      }
    ],
    socialmedia: { instagram: 'arianee_project', twitter: 'ArianeeProject' },
    externalContents: [
      {
        title: 'About Arianee',
        url: 'https://www.arianee.org',
        backgroundColor: '#000',
        color: '#FFF'
      }
    ],
    jsonSurcharger: 'url'
  }
});
})();
