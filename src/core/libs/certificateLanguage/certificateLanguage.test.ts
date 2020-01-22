import lodash from 'lodash';
import { ArianeeCertificatei18n } from '../../../models/jsonSchema/certificates/ArianeeProducti18n';
import { CertificateSummary } from '../../wallet/certificateSummary';
import { replaceLanguage, replaceLanguageContent } from './certificateLanguage';
import { certificatei18n } from './certificateMock';

describe('Certificate Language', () => {
  test('should replace by selected language', () => {
    const clonedCertificate:CertificateSummary<ArianeeCertificatei18n, any> = lodash.cloneDeep(certificatei18n as any);

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
    const clonedCertificate:CertificateSummary<ArianeeCertificatei18n, any> = lodash.cloneDeep(certificatei18n as any);

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

    const value = replaceLanguage(clonedCertificate, ['en', 'fr-FR']);

    expect(value.content.data.description).toBe(expectedTranslations.description);
    expect(value.content.data.externalContents).toEqual(expectedTranslations.externalContents);
  });
});
