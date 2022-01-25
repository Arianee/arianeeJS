import { Arianee, NETWORK } from '../src';
import { makeWalletReady } from '../features/steps/helpers/walletCreator';

(async function () {
  const arianee = await new Arianee().init(NETWORK.testnet);
  const wallet = arianee.fromPrivateKey('0x510701c5f68e96bc5ac843be8951bc24d93c001673ac94a9df2c5ffd783ea4c0');

  // await makeWalletReady(wallet);
  console.log(wallet.address);

  const b = await wallet.methods.createCertificateRequestOwnershipLink(732304272, 'f6ixxez0mwc2').catch();

  wallet.methods.requestCertificateOwnership(732304272, 'f6ixxez0mwc2').catch(e => {
    console.log('1');
    console.log(e);
  });
  wallet.methods.requestCertificateOwnership(732304272, 'f6ixxez0mwc2').catch(e => {
    console.log('2');
    console.log(e);
  });
})();
