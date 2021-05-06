import { NETWORK } from '../src';
import { Arianee } from '../src/core/arianee';

(async function () {
  const arianee = await new Arianee().init(NETWORK.mumbai);

  const wallet = arianee.fromRandomMnemonic();
  // await wallet.contracts.storeContract.methods.setAriaUSDExchange(10).send();
  console.log(await wallet.methods.balanceOfAria());
  console.log(await wallet.methods.balanceOfPoa());

  // await wallet.methods.approveStore();
  await wallet.methods.buyCredits('certificate', 10);

  const result = await wallet.methods.createCertificate({
    content: {
      $schema: 'https://cert.arianee.org/version1/ArianeeAsset.json'
    }
  });
  console.log(result);
})();
