import { certificateParentMerger } from './certificateParentMerger';

describe('certificateParentMerger', () => {
  const parentContent0 = () => ({
    $schema: 'https://cert.arianee.org/version3/ArianeeProductCertificate-i18n.json',
    sku: 'from parent0',
    externalContents: [
      {
        title: 'About Arianee',
        url: 'https://www.arianee.org',
        backgroundColor: '#000',
        color: '#FFF'
      }
    ]
  });

  const parentContent1 = () => ({
    $schema: 'https://cert.arianee.org/version3/ArianeeProductCertificate-i18n.json',
    name: 'my anme',
    externalContents: [
      {
        title: 'About Arianee',
        url: 'https://www.arianee.org',
        backgroundColor: '#000',
        color: '#FFF'
      }
    ]
  });

  const childContent = () => ({
    $schema: 'https://cert.arianee.org/version3/ArianeeProductCertificate-i18n.json',
    title: 'mon titre',
    parentCertificates: [
      {
        type: 'full',
        order: 0,
        arianeeLink: 'https://test.arianee.net/742238147,oku0etfug7xy'
      }
    ]
  });
  test('it should merge in order parents', () => {
    const mergedCertitifcate = certificateParentMerger([parentContent1(), parentContent0(), childContent()]);

    expect(mergedCertitifcate).toEqual({
      $schema: 'https://cert.arianee.org/version3/ArianeeProductCertificate-i18n.json',
      name: 'my anme',
      sku: 'from parent0',
      externalContents: [
        {
          title: 'About Arianee',
          url: 'https://www.arianee.org',
          backgroundColor: '#000',
          color: '#FFF'
        }
      ],
      title: 'mon titre',
      parentCertificates: [
        {
          type: 'full',
          order: 0,
          arianeeLink: 'https://test.arianee.net/742238147,oku0etfug7xy'
        }
      ]
    });
  });
});
