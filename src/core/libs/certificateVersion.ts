import { ArianeeCertificatei18n } from '../../models/jsonSchema/certificates/ArianeeProducti18n';
import { get } from 'lodash';
import { isNullOrUndefined } from './isNullOrUndefined';
export function isSchemai18n (x: any): x is ArianeeCertificatei18n {
  return !isNullOrUndefined(get(x, 'i18n'));
}
