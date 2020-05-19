import { makeWalletReady } from '../features/steps/helpers/walletCreator';
import { Arianee, NETWORK } from '../src';
import { blockchainEventsName } from '../src/models/blockchainEventsName';

(async function () {
  const arianee = await new Arianee().init(NETWORK.testnet);

  const wallet = arianee.fromPrivateKey('0xa7e539b82163745b4a40d38ee0c9bbc5ab08b7e575b4b8fbf336aa9637327870');
  await wallet.contracts.storeContract.methods.buyCredit(1, 5, wallet.address).send();

  const certificateId = 2789286;
  /*
  const result2 = await wallet.methods.createMessage({
    certificateId: certificateId,
    content: {
      $schema: 'https://cert.arianee.org/version1/ArianeeAsset.json',
      name: 'Arianee',
      v: '0.1'
    }
  });

  console.log(result2);

  const result3 = await wallet.methods.storeMessage(5270784,
    {
      $schema: 'https://cert.arianee.org/version1/ArianeeAsset.json',
      name: 'Arianee',
      v: '0.1'
    }
    , 'http://localhost:3000/rpc');
*/

  const d = await wallet.methods.getMyMessages({ url: 'http://localhost:3000/rpc' });

  console.log(d);
})();
