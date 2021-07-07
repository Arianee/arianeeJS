import {Arianee, NETWORK} from "../src";

(async function () {

  for(let i=0;i<200;i++){
    const arianee = await new Arianee().init(NETWORK.arianeeTestnet);
    const wallet = arianee.fromRandomKey();
    await wallet.requestPoa();
    await wallet.requestAria();
    console.log(`${i}/199`)
  }

})();
