import { makeWalletReady } from '../features/steps/helpers/walletCreator';
import { Arianee, NETWORK } from '../src';
import { blockchainEventsName } from '../src/models/blockchainEventsName';

(async function () {
  (async function () {
    const arianee = await new Arianee().init(NETWORK.testnet);
    const wallet = arianee.fromPrivateKey('0x14a99f4c1f00982e9f3762c9abaf88b30e9f3e6bb8b89bc99ecb76e1cd7a6538');
    console.log('makeWalletReady');

    await makeWalletReady(wallet);

    console.log(wallet.address);

    await wallet.methods.buyCredits('certificate',1);

    const result = await wallet.methods.createCertificate({
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
    })
  
    const { certificateId, passphrase, ...rest } = result;
    console.log(certificateId, passphrase);
    console.log('success');



    //const certificateId = 1864296;

    const thirdPartyWallet = arianee.fromRandomMnemonic();
    await makeWalletReady(thirdPartyWallet);

    console.log('buyCredits message');
    await thirdPartyWallet.methods.buyCredits('message',10);

    
    const messageSent = await thirdPartyWallet.methods.createMessage({
      certificateId,
      content: {
        $schema: 'https://cert.arianee.org/version1/ArianeeAsset.json',
        name: 'Arianee',
        v: '0.1',
      }
    }).catch((e) => {
      console.log(e);
    });
    

    console.log('message sent', messageSent);    

    console.log('userActionContract ',thirdPartyWallet.address);
    await wallet.contracts.userActionContract.methods.addAddressToWhitelist(certificateId,thirdPartyWallet.address).send();
    console.log('userActionContract success');


    const messageSent2 = await thirdPartyWallet.methods.createMessage({
      certificateId,
      content: {
        $schema: 'https://cert.arianee.org/version1/ArianeeAsset.json',
        name: 'Arianee',
        v: '0.1',
      }
    }).catch((e) => {
      console.log(e);
    });

    console.log('message sent', messageSent2);

    /*
    const i = await wallet.methods.createActionProofLink('http://localhost:4200', 2476541, 'em2iomuvn48c');
    const d = await wallet.methods.isCertificateProofValidFromActionProofLink('http://localhost:4200\'');
    console.log(d);
    */
  })();
})();
