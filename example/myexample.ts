import { Arianee, NETWORK } from '../src';
import { ArianeeCertificate } from '../src/models/jsonSchema/certificates/ArianeeAsset';
import { ArianeeCertificatei18n } from '../src/models/jsonSchema/certificates/ArianeeProducti18n';
import { ArianeeBrandIdentityi18n } from '../src/models/jsonSchema/identities/ArianeeBrandIdentityi18n';

(async function () {
  const arianee = await new Arianee().init(NETWORK.testnet);

  const wallet = arianee.fromRandomMnemonic();

  const e = await wallet.methods.getCertificate<ArianeeCertificatei18n, ArianeeBrandIdentityi18n>(522425, 'z2s1gdbc8uptp', { content: true, advanced: { languages: ['fr'] } });
})();
