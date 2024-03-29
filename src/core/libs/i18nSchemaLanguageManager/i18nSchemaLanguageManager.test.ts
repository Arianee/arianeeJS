import lodash from 'lodash';
import { ArianeeCertificatei18n } from '../../../models/jsonSchema/certificates/ArianeeProducti18n';
import { CertificateSummary } from '../../wallet/certificateSummary';
import {
  replaceLanguage,
  replaceLanguageContent,
  replaceLanguageIdentityContentWithFavUserLanguage
} from './i18nSchemaLanguageManager';
import { certificatei18n1, certificatei18n2 } from './certificateMock';
import { eventI18n } from './eventMock';
import { identityI18n } from './identityMock';
import { ArianeeBrandIdentityi18n } from '../../../models/jsonSchema/identities/ArianeeBrandIdentityi18n';

describe('Certificate Language', () => {
  test('should replace by selected language', () => {
    const clonedCertificate:CertificateSummary<ArianeeCertificatei18n, any> = lodash.cloneDeep(certificatei18n1 as any);

    const expectedTranslations = {
      language: 'fr-FR',
      description: 'fr-FRdescription',
      subDescription: [
        {
          type: 'service',
          title: 'title servicing fr',
          content: 'content title servicing fr'
        }
      ],
      externalContents: [
        {
          type: 'website',
          title: 'Frwebsite'
        }
      ]
    };

    // Preparing data
    clonedCertificate.content.data.i18n.push(<any>expectedTranslations);

    const value = replaceLanguageContent(clonedCertificate.content.data, 'fr-FR');

    expect(value.description).toBe(expectedTranslations.description);
    expect(value.externalContents).toEqual(expectedTranslations.externalContents);
  });
  test('should replace by prefered languages', () => {
    const clonedCertificate:CertificateSummary<ArianeeCertificatei18n, any> = lodash.cloneDeep(certificatei18n1 as any);

    const expectedTranslations = {
      language: 'fr-FR',
      description: 'fr-FRdescription',
      subDescription: [
        {
          type: 'service',
          title: 'title servicing fr',
          content: 'content title servicing fr'
        }
      ],
      externalContents: [
        {
          type: 'website',
          title: 'Frwebsite'
        }
      ]
    };

    // Preparing data
    clonedCertificate.content.data.i18n.push(<any>expectedTranslations);

    const value = replaceLanguage(clonedCertificate, ['fr-FR', 'de']);

    expect(value.content.data.description).toBe(expectedTranslations.description);
    expect(value.content.data.externalContents).toEqual(expectedTranslations.externalContents);
  });
  test('should take into account default language at root level', () => {
    const clonedCertificate:CertificateSummary<ArianeeCertificatei18n, any> = lodash.cloneDeep(certificatei18n2 as any);

    clonedCertificate.content.data.externalContents = [
      {
        type: 'transparency',
        title: 'root transparency',
        url: 'https://cert.arianee.org/transparency/transparency-example1.json'
      }
    ];

    const value = replaceLanguage(clonedCertificate, ['fr-FR', 'en-US']);

    expect(value.content.data.description).toBe('Le TARDIS en Francais');
    expect(value.content.data.externalContents[0].title).toBe('root transparency');

    expect(true).toBeTruthy();
  });

  test('language is wrongly defined', () => {
    const clonedCertificate:CertificateSummary<ArianeeCertificatei18n, any> = lodash.cloneDeep(certificatei18n1 as any);

    const wronglydefinedTranslation = {
      language: undefined,
      description: 'esdescription'
    };

    // Preparing data
    clonedCertificate.content.data.i18n.push(<any>wronglydefinedTranslation);

    const value = replaceLanguageContent(clonedCertificate.content.data, 'es');

    expect(value.description).toBe('MAINdescription');
  });
});
describe('Event Language', () => {
  test('should replace by selected language FR', () => {
    const clonedCertificate:CertificateSummary<ArianeeCertificatei18n, any> = lodash.cloneDeep(eventI18n as any);

    const expectedTranslations = {
      language: 'fr-FR',
      title: 'Vente initiale'
    };

    // Preparing data
    clonedCertificate.content.data.i18n.push(<any>expectedTranslations);

    const value = replaceLanguageContent(clonedCertificate.content.data, 'fr-FR');

    expect(value.title).toBe(expectedTranslations.title);
  });
  test('should replace by selected language zh-CN', () => {
    const clonedCertificate:CertificateSummary<ArianeeCertificatei18n, any> = lodash.cloneDeep(eventI18n as any);

    const expectedTranslations = {
      language: 'zh-CN',
      title: '原始销售'
    };

    clonedCertificate.content.data.i18n.push(<any>expectedTranslations);

    const value = replaceLanguageContent(clonedCertificate.content.data, 'zh-CN');

    expect(value.title).toBe(expectedTranslations.title);
  });

  test('language is wrongly defined', () => {
    const clonedCertificate:CertificateSummary<ArianeeCertificatei18n, any> = lodash.cloneDeep(eventI18n as any);

    const wronglydefinedTranslation = {
      language: undefined,
      title: 'Vente initiale'
    };

    // Preparing data
    clonedCertificate.content.data.i18n.push(<any>wronglydefinedTranslation);

    const value = replaceLanguageContent(clonedCertificate.content.data, 'fr-FR');

    expect(value.title).toBe('Original Sale');
  });
});
describe('Identity', () => {
  test('language is wrongly defined', () => {
    const clonedIdentity:ArianeeBrandIdentityi18n = lodash.cloneDeep(identityI18n as any);
    clonedIdentity.i18n[0].language = undefined;

    const wronglydefinedTranslation = {
      description: 'Brand test anglais'
    };

    const value = replaceLanguageIdentityContentWithFavUserLanguage(clonedIdentity, ['fr']);
    expect(value.description).toBe(wronglydefinedTranslation.description);
  });
});
