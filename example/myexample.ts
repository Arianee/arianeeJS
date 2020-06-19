import { makeWalletReady } from '../features/steps/helpers/walletCreator';
import { Arianee, NETWORK } from '../src';
import { blockchainEventsName } from '../src/models/blockchainEventsName';

(async function () {
  const arianee = await new Arianee().init(NETWORK.testnet);
  const wallet = arianee.fromPrivateKey('0x6c2504d31d9c51e24e23048c80f1b83cdf8c491fce77d5f193d3d906ab60cd2b');
  // console.log(wallet.address);
  // console.log(await wallet.contracts.smartAssetContract.methods.ownerOf(45678745678765456).call());

  // await wallet.methods.requestCertificateOwnership(31136419, 'hdj7i2m9q4ey');

  const ActionJWTProofLink = wallet.methods.createActionJWTProofLink('http://lemonde.fr', 31136419);
  // console.log(ActionJWTProofLink);
  const url = new URL(ActionJWTProofLink);
  console.log(url.searchParams.get('arianeeJWT'));

  // const d = wallet.methods.createCertificateJWTProof(45678745678765456);

  //  console.log(d);

  // const isValid = await wallet.methods.isJWTProofValid(d);
  // console.log('isValid', isValid);

  // const l = wallet.methods.decodeJWTProof(d);
  // console.log(l);
})();
