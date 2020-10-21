import { waitFor } from '../features/steps/helpers/waitFor';
import { makeWalletReady } from '../features/steps/helpers/walletCreator';
import { Arianee, NETWORK } from '../src';
import { blockchainEventsName } from '../src/models/blockchainEventsName';

(async function () {
  const arianee = await new Arianee().init(NETWORK.testnet);
  const wallet = arianee.fromMnemonic('foot badge oblige step aim boss seed banana congress require angle solution');

  // const { certificateId } = await wallet.methods.reserveCertificateId();
  const certificateId = 182077024;
  console.log('certId', certificateId);
  try {
    await wallet.methods.createAndStoreCertificate({
      certificateId: certificateId,
      content: {
        $schema: 'https://cert.arianee.org/version1/ArianeeAsset.json',
        name: 'Arianee'
      }

    }, 'https://arianee.cleverapps.io/testnet/rpc'
    );
  } catch (e) {
    console.log('errror');
    console.log(e);
  }

})();
