import { makeWalletReady } from '../features/steps/helpers/walletCreator';
import { Arianee, NETWORK } from '../src';
import { aria } from '../src/configurations';
import { waitFor } from '../features/steps/helpers/waitFor';

const fs = require('fs');

var fetch = require('node-fetch-polyfill');

(async function () {
  const arianee = await new Arianee().init(NETWORK.arianeeTestnet);

  const wallet = arianee.fromPrivateKey('0xe7cfc290a5b9f5ad89978fa91eac0af0ca05eaa478c77735e13cf493cab40855');

  const cert1 = '1,cert1passphrase'; // valid et un waiting
  const cert2 = '2,cert2passphrase;,'; // only waiting

  // 0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0
  const cert = await wallet.methods.getCertificate(2, 'cert2passphrase;,', { content: true, issuer: true });
  console.log(cert.issuer.identity.imprint);
  console.log(cert.content.imprint);

  console.log('####');
})();

/*
public syncWithBlockChain ():Observable<any> {
  console.log('here');
return this.$wallet.pipe(
    take(1),0x31bd6f933aa9260509f4dced76f3410872f220e828c05d7f009a8796bff1ac05
    delay(1000),
    mergeMap(wallet => {
      const currentConfig = wallet.globalConfiguration.getMergedQuery({});
      currentConfig.issuer = {
        ...currentConfig.issuer as any,
        forceRefresh: true
      };

      return from(wallet.methods.getMyCertificates(currentConfig));
    }),
    mergeMap(certificates => this.$wallet),
    tap(wallet => this.$wallet.next(wallet))
);
}

 */
