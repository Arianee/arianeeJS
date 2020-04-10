import { ArianeeCertificatei18n } from '../../../models/jsonSchema/certificates/ArianeeProducti18n';
import { CertificateSummary } from '../../wallet/certificateSummary';
import { pickLanguageAccordingToUserLanguages } from 'iso-language-picker';

export const replaceLanguage = (certificateSummary :CertificateSummary<ArianeeCertificatei18n, any>, languages:string[]):CertificateSummary<ArianeeCertificatei18n, any> => {
  const availableLanguages = this.availableLanguages(certificateSummary.content.data);
  const language = pickLanguageAccordingToUserLanguages(languages, availableLanguages);

  if (language) {
    certificateSummary.content.data = replaceLanguageContent(certificateSummary.content.data, language);
  }

  return certificateSummary;
};

export const availableLanguages = (certificateId18n: ArianeeCertificatei18n, language: string): string[] => {
  return certificateId18n.i18n.map(i => i.language);
};

export const replaceLanguageContent = (certificateId18n :ArianeeCertificatei18n, language:string):ArianeeCertificatei18n => {
  const translated = certificateId18n.i18n.find(i => i.language === language);

  return {
    ...certificateId18n,
    ...translated
  };
};
