import { Arianee, NETWORK } from '../src';

(async function () {
  const arianee = await new Arianee().init(NETWORK.testnet);

 

  /*
  const parentContent0 = {
    $schema: 'https://cert.arianee.org/version3/ArianeeProductCertificate-i18n.json',
    name: 'john',
    externalContents: [
      {
        title: 'About Arianee',
        url: 'https://www.arianee.org',
        backgroundColor: '#000',
        color: '#FFF'
      }
    ]
  };

  const parentContent1 = {
    $schema: 'https://cert.arianee.org/version3/ArianeeProductCertificate-i18n.json',
    sku: '"mon sky',
    title: 'titre nonnon',
    externalContents: [
      {
        title: 'About Arianee',
        url: 'https://www.arianee.org',
        backgroundColor: '#000',
        color: '#FFF'
      }
    ]
  };

  const content = {
    $schema: 'https://cert.arianee.org/version3/ArianeeProductCertificate-i18n.json',
    title: 'mon titre',
    parentCertificates: [
      {
        type: 'full',
        order: 0,
        arianeeLink: 'https://test.arianee.net/755679764,5w2y7zoxmk7n'
      },
      {
        type: 'full',
        order: 1,
        arianeeLink: 'https://test.arianee.net/857212492,1hkahyv4gj52' // proof || viewkey
        arianeeLink: jwt.ezfonzefezon.zefezf
      }
    ]
  };

  const { certificateId, passphrase, deepLink } = await wallet.methods.createAndStoreCertificate({
    content: content
  }, 'https://arianee.cleverapps.io/testnet/rpc');

  console.log(certificateId, passphrase, deepLink);
*/
  const b = await wallet.methods.getCertificate(7305865, '', {
    content: true,
    events: true,
    arianeeEvents: true,

  });

  console.log(wallet.address)
  console.log(b.events.arianeeEvents);
})();
