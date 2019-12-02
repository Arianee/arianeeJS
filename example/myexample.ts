import { makeWalletReady } from '../features/steps/helpers/walletCreator';
import { Arianee, NETWORK } from '../src';
import { aria } from '../src/configurations';
import { waitFor } from '../features/steps/helpers/waitFor';

const fs = require('fs');

var fetch = require('node-fetch-polyfill');

(async function () {
  const arianee = await new Arianee().init(NETWORK.testnet);

  const wallet = arianee.fromPrivateKey('0xe7cfc290a5b9f5ad89978fa91eac0af0ca05eaa478c77735e13cf493cab40855');
  console.log('####');

  const cer = await wallet.methods.getCertificate(46713, undefined, { issuer: { waitingIdentity: true, forceRefresh: true } });
})();

/*
public syncWithBlockChain ():Observable<any> {
  console.log('here');
return this.$wallet.pipe(
    take(1),
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
