import { ArianeeCertificatei18n } from '../../../models/jsonSchema/certificates/ArianeeProducti18n';
import { CertificateSummary } from '../../wallet/certificateSummary';

export const replaceLanguage = (certificateSummary :CertificateSummary<ArianeeCertificatei18n, any>, languages:string[]):CertificateSummary<ArianeeCertificatei18n, any> => {
  for (let i = 0; i < languages.length; i++) {
    if (isLanguageExist(certificateSummary.content.data, languages[i])) {
      certificateSummary.content.data = replaceLanguageContent(certificateSummary.content.data, languages[i]);
      break;
    }
  }

  return certificateSummary;
};

export const isLanguageExist = (certificateId18n :ArianeeCertificatei18n, language:string):boolean => {
  const translated = certificateId18n.i18n.find(i => i.language === language);

  return translated !== undefined;
};

export const replaceLanguageContent = (certificateId18n :ArianeeCertificatei18n, language:string):ArianeeCertificatei18n => {
  const translated = certificateId18n.i18n.find(i => i.language === language);

  return {
    ...certificateId18n,
    ...translated
  };
};
