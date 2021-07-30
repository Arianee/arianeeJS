import { ArianeeCertificatei18n } from '../../../models/jsonSchema/certificates/ArianeeProducti18n';
import { get } from 'lodash';
import { isNullOrUndefined } from '../isNullOrUndefined/isNullOrUndefined';
import { ArianeeBrandIdentityi18n } from '../../../models/jsonSchema/identities/ArianeeBrandIdentityi18n';

export function isSchemai18n (x: any): x is ArianeeCertificatei18n {
  return !isNullOrUndefined(get(x, 'i18n'));
}

export function isIdentitySchemai18n (x: any): x is ArianeeBrandIdentityi18n {
  return !isNullOrUndefined(get(x, 'i18n'));
}
