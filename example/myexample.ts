import { makeWalletReady } from '../features/steps/helpers/walletCreator';
import { Arianee, NETWORK } from '../src';
import { blockchainEventsName } from '../src/models/blockchainEventsName';

(async function () {
  const arianee = await new Arianee().init(NETWORK.testnet);
  const wallet = arianee.fromPrivateKey('0x6c2504d31d9c51e24e23048c80f1b83cdf8c491fce77d5f193d3d906ab60cd2b');
  // console.log(wallet.address);
  // console.log(await wallet.contracts.smartAssetContract.methods.ownerOf(45678745678765456).call());

  // await wallet.methods.requestCertificateOwnership(31136419, 'hdj7i2m9q4ey');

  await wallet.methods.approveStore();
  await wallet.methods.createAndStoreCertificate({
    content: {
      $schema: 'https://cert.arianee.org/version1/ArianeeProductCertificate-i18n.json',
      name: 'Top Time Limited Edition'
    }
  }, 'https://arianee.cleverapps.io/testnet/rpc')
    .catch(e => console.log(e))

  /*
  const certificate = await wallet.methods.getCertificate(31136419, undefined, { content: true });

  await wallet.methods.storeContentInRPCServer(31136419, certificate.content.data, 'http://localhost:3000/rpc');

  const jwt = wallet.methods.createCertificateJWTProof(31136419);

  const otherWallet = arianee.fromRandomMnemonic();

  const d = await otherWallet.methods.getCertificateFromJWT(jwt, { content: true, issuer: { rpcURI: 'http://localhost:3000/rpc' } });

  console.log(d);
  // const ActionJWTProofLink = wallet.methods.createActionJWTProofLink('http://lemonde.fr', 31136419);

  //  console.log(d);

  // const isValid = await wallet.methods.isJWTProofValid(d);
  // console.log('isValid', isValid);

  // const l = wallet.methods.decodeJWTProof(d);
  // console.log(l);
   */
})();
