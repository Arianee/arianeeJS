import { makeWalletReady } from '../features/steps/helpers/walletCreator';
import { Arianee, NETWORK } from '../src';
import { blockchainEventsName } from '../src/models/blockchainEventsName';

(async function () {
  const arianee = await new Arianee().init(NETWORK.testnet);

  const wallet = arianee.fromRandomKey();

  await makeWalletReady(wallet);

  console.log(wallet.address);



  const buy = await wallet.contracts.storeContract.methods.buyCredit(0, 5, wallet.address).send();
  const buyMessage = await wallet.contracts.storeContract.methods.buyCredit(1, 5, wallet.address).send();

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
  });  



  const result2 = await wallet.methods.sendMessage({
    certificateId: result.certificateId,
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


  const result3 = await wallet.methods.sendMessage({
    certificateId: result.certificateId,
    content: {
      $schema: 'https://cert.arianee.org/version1/ArianeeAsset.json',
      name: 'Arianee',
      v: '0.1',
      serialnumber: [{ type: 'serialnumber', value: 'SAMPLE' }],
      brand: 'Arianee',
      model: 'Token goody2',
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




  const messages = await wallet.methods.getMyMessages();
  
  console.log(messages)

  let readStatus;

  for (let i = 0 ; i < messages.length ; i++) {
    readStatus = await wallet.methods.markAsRead(messages[i].messageId);
    console.log(readStatus);
    readStatus = await wallet.methods.markAsRead(messages[i].messageId);
    console.log(readStatus);    
  }

  

})();
