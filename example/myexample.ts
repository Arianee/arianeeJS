import { makeWalletReady } from '../features/steps/helpers/walletCreator';
import { Arianee, NETWORK } from '../src';
import { blockchainEventsName } from '../src/models/blockchainEventsName';

(async function () {
  const arianee = await new Arianee().init(NETWORK.testnet);

  const wallet = arianee.fromMnemonic('autumn balcony range return enact educate firm glare then pool round message');

  const i = await wallet.methods.getCertificate(49400, 'y9a2obb58tgo',
    {
      arianeeEvents: true,
      content: true,
      issuer: true,
      advanced: {
        languages: ['zh-TW']
      }
    });
  console.log(i.events.arianeeEvents[0].content.data);
})();
