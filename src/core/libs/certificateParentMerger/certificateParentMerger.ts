import { mergeWith } from 'lodash';
import { ArianeeCertificatei18nV3 } from '../../../models/jsonSchema/certificates/ArianeeProducti18n';

/**
 * Will be merged from 0 to last content
 * @param {Array<any>} override
 * @returns {{}}
 */
export const certificateParentMerger = (override: Array<any>):ArianeeCertificatei18nV3 => {
  const content = {};
  override.forEach(d => {
    mergeWith(content, d);
  });

  return content as ArianeeCertificatei18nV3;
};
