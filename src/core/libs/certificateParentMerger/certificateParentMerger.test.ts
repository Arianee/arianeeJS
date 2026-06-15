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

  const parentNotice = { type: 'website', title: 'Notice', url: 'https://example.com/notice' };
  const childLink = { type: 'website', title: 'Child link', url: 'https://example.com/child' };

  test('it should concatenate child externalContents after the parent ones instead of overriding them (ARI-3292)', () => {
    const merged = certificateParentMerger([
      { name: 'parent name', externalContents: [parentNotice] },
      { name: 'child name', externalContents: [childLink] }
    ]);

    expect(merged.name).toEqual('child name');
    expect(merged.externalContents).toEqual([parentNotice, childLink]);
  });

  test('it should keep parent externalContents when the child has none', () => {
    const merged = certificateParentMerger([
      { externalContents: [parentNotice] },
      { name: 'child name' }
    ]);

    expect(merged.externalContents).toEqual([parentNotice]);
  });

  test('it should remove externalContents duplicated between parent and child', () => {
    const merged = certificateParentMerger([
      { externalContents: [parentNotice] },
      { externalContents: [{ ...parentNotice }, childLink] }
    ]);

    expect(merged.externalContents).toEqual([parentNotice, childLink]);
  });

  test('it should concatenate i18n externalContents by language and keep parent-only languages (ARI-3292)', () => {
    const parentNoticeEn = { type: 'website', title: 'Notice EN', url: 'https://example.com/notice-en' };
    const parentNoticeFr = { type: 'website', title: 'Notice FR', url: 'https://example.com/notice-fr' };
    const childLinkEn = { type: 'website', title: 'Child link EN', url: 'https://example.com/child-en' };

    const merged = certificateParentMerger([
      {
        i18n: [
          { language: 'fr-FR', externalContents: [parentNoticeFr] },
          { language: 'en-US', externalContents: [parentNoticeEn] }
        ]
      },
      { i18n: [{ language: 'en-US', externalContents: [childLinkEn] }] }
    ]);

    expect((merged as any).i18n).toEqual([
      { language: 'fr-FR', externalContents: [parentNoticeFr] },
      { language: 'en-US', externalContents: [parentNoticeEn, childLinkEn] }
    ]);
  });
});
