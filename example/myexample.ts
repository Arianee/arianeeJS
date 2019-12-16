import { Arianee, NETWORK } from '../src';

const fs = require('fs');

var fetch = require('node-fetch-polyfill');

(async function () {
  const arianee = await new Arianee().init(NETWORK.testnet);

  const wallet = arianee.fromPrivateKey('0x4a608dcdb610fb5a18850f29c85078f00e2b9266a0b0437e3c6e0a6096b1caf4',
    'http://localhost:5000/bdharianeestef/us-central1');

  await wallet.methods.createCertificate({
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

  console.log('####');
})();

/*
public syncWithBlockChain ():Observable<any> {
  console.log('here');
return this.$wallet.pipe(
    take(1),
    delay(1000),
    mergeMap(wallet => {
      const currentConfig = wallet.globalConfiguration.getMergedQuery({});
      currentConfig.issuer = {
        ...currentConfig.issuer as any,
        forceRefresh: true
      };

      return from(wallet.methods.getMyCertificates(currentConfig));
    }),
    mergeMap(certificates => this.$wallet),
    tap(wallet => this.$wallet.next(wallet))
);
}

 */
