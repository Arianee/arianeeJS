import { makeWalletReady } from '../features/steps/helpers/walletCreator';
import { NETWORK } from '../src';
import { Arianee } from '../src/core/arianee';

export const createAndTransfertCertificates = async () => {
  const arianee = await new Arianee().init(NETWORK.arianeeTestnet);
  const wallet1 = arianee.fromRandomKey();
  await makeWalletReady(wallet1);

  const nextOwnerWallet = arianee.fromRandomKey();

  await makeWalletReady(nextOwnerWallet);

  await wallet1.storeContract.methods.buyCredit(0, 5, wallet1.publicKey).send();

  console.log('hydrate starting');
  const hash = wallet1.web3.utils.keccak256(`ezofnzefon${Date.now()}`);
  const result = await wallet1.methods.createCertificate({
    uri: 'https://api.myjson.com/bins/cf4ph',
    hash
  });

  const { certificateId, passphrase } = result;
  console.log(certificateId, passphrase);
  console.log('hydrate ending');
  console.log(`https://arian.ee/${certificateId},${passphrase}`);

  await wallet1.smartAssetContract.methods
    .ownerOf(certificateId)
    .call();

  console.log('startint request token');
  await nextOwnerWallet.methods
    .requestCertificateOwnership(certificateId, passphrase)
    .then(i => console.log('successss requesting token'));

  const owner = await wallet1.smartAssetContract.methods
    .ownerOf(certificateId)
    .call();

  await nextOwnerWallet.methods.getCertificate(certificateId)
    .then(i => console.log(i.owner.isOwner));

  console.log('FINISH!!');
};
