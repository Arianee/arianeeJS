import { ArianeeCertificatei18n } from '../../../models/jsonSchema/certificates/ArianeeProducti18n';
import { CertificateSummary } from '../../wallet/certificateSummary';
import { pickLanguageAccordingToUserLanguagesWithMacrosFallback } from '@arianee/iso-language-picker';

const macros = ['fr-FR', 'en-US', 'ko-KR', 'ja-JP', 'de-DE'];

export const replaceLanguage = (certificateSummary :CertificateSummary<ArianeeCertificatei18n, any>, languages:string[]):CertificateSummary<ArianeeCertificatei18n, any> => {
  const availableLanguages = this.availableLanguages(certificateSummary.content.data);
  const defaultLanguage = certificateSummary.content.data.language;

  const language = pickLanguageAccordingToUserLanguagesWithMacrosFallback(macros, languages, availableLanguages, defaultLanguage);

  if (language) {
    certificateSummary.content.data = replaceLanguageContent(certificateSummary.content.data, language);
  }

  return certificateSummary;
};

export const availableLanguages = (certificateId18n: ArianeeCertificatei18n, language: string): string[] => {
  const defaultLanguage = certificateId18n.language;
  const availableTranslation = certificateId18n.i18n.map(i => i.language);

  return [defaultLanguage, ...availableTranslation];
};

export const replaceLanguageContent = (certificateId18n :ArianeeCertificatei18n, language:string):ArianeeCertificatei18n => {
  const translated = certificateId18n.i18n.find(i => i.language === language);

  return {
    ...certificateId18n,
    ...translated
  };
};
