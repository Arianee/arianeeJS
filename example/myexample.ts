import { NETWORK } from '../src';
import { Arianee } from '../src/core/arianee';

(async function () {
  const arianee = await new Arianee().init(NETWORK.polygon, {
    defaultArianeePrivacyGateway:"https://polygon.arianee.net",
    transactionOptions:{
      gasPrice:1010000000,
      gas: 2000000,
    }
  });

  const wallet = arianee.readOnlyWallet();

  const events = await wallet.contracts.smartAssetContract.getPastEvents('Hydrated',{
    fromBlock:14641850,
    toBlock:14641852
  })

  console.log(events);

})();
