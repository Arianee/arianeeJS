import { Arianee, NETWORK } from '../src';
import { ArianeeCertificate } from '../src/models/jsonSchema/certificates/ArianeeAsset';
import { ArianeeCertificatei18n } from '../src/models/jsonSchema/certificates/ArianeeProducti18n';
import { ArianeeBrandIdentityi18n } from '../src/models/jsonSchema/identities/ArianeeBrandIdentityi18n';

(async function () {
  const arianee = await new Arianee().init(NETWORK.arianeeTestnet);

  const wallet = arianee.fromRandomMnemonic();
  const certificateId = 1;
  const passphrase = 'cert1passphrase';

  const certificateSummary = await wallet.methods.getCertificate(certificateId, passphrase, { content: true });
  console.log('got');
  await wallet.methods.storeContentInRPCServer(certificateId, certificateSummary.content.data, 'http://localhost:3000/rpc');
  console.log('stored');

  const wallet2 = arianee.fromRandomMnemonic();
  const summar = await wallet2.methods.getCertificate(certificateId, passphrase, { content: true, issuer: { rpcURI: 'http://localhost:3000/rpc' } });

  console.log(summar.content.data);
})();
