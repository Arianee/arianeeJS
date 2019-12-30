import { makeWalletReady } from '../features/steps/helpers/walletCreator';
import { Arianee, NETWORK } from '../src';
import { aria } from '../src/configurations';
import { waitFor } from '../features/steps/helpers/waitFor';

const fs = require('fs');

var fetch = require('node-fetch-polyfill');

(async function () {
  const content = {
    uri: 'https://bdharianeestef.firebaseapp.com/rpc',
    content: {
      $schema: 'https://cert.arianee.org/version1/ArianeeAsset.json',
      name: 'Arianeetest certificate 1',
      v: '0.1',
      serialnumber: [Array],
      brand: 'Arianee',
      model: 'Token goody',
      description:
          'Here is the digital passport of your Arianee token goody, giving you a glimpse of an augmented ownership experience. This Smart-Asset has a unique ID. It is transferable and enables future groundbreaking features. \n Connect with the arianee team to learn more.',
      type: 'SmartAsset',
      picture:
          'https://www.arianee.org/wp-content/uploads/2019/02/Screen-Shot-2019-02-27-at-12.12.53-PM.png',
      pictures: [Array],
      socialmedia: [Object],
      externalContents: [Array],
      jsonSurcharger: 'url'
    }
  };

  const arianee = await new Arianee().init(NETWORK.testnet);

  const wallet = arianee.fromPrivateKey('0xe7cfc290a5b9f5ad89978fa91eac0af0ca05eaa478c77735e13cf493cab40855',
    'https://bdharianeestef.firebaseapp.com');
  // await makeWalletReady(wallet);
  //  await wallet.methods.buyCredits('certificate', 1);
  const certificateid = 2677652;
  const passphrase = 'tca17v5ce257';

  /// const res = await wallet.methods.createCertificate(content);
  const content1 = await wallet.methods.getCertificate(certificateid, passphrase, { content: true });

  const i = await wallet.methods.storeContentInRPCServer(certificateid, content.content);
  const content2 = await wallet.methods.getCertificate(certificateid, passphrase, { content: true });
  console.log(content2);
  console.log('done');
})();

/*
public syncWithBlockChain ():Observable<any> {
  console.log('here');
return this.$wallet.pipe(
    take(1),0x31bd6f933aa9260509f4dced76f3410872f220e828c05d7f009a8796bff1ac05
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
