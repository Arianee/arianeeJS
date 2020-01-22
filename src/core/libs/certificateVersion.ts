import { ArianeeCertificatei18n } from '../../models/jsonSchema/certificates/ArianeeProducti18n';

export function isCertificateI18n (x: any): x is ArianeeCertificatei18n {
  return x.i18n !== undefined;
}
