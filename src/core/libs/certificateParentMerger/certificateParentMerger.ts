import { isArray, isEqual, mergeWith, uniqWith } from 'lodash';
import { ArianeeCertificatei18nV3 } from '../../../models/jsonSchema/certificates/ArianeeProducti18n';

/**
 * Concatenates parent and child externalContents (parent entries first) and
 * removes strictly identical duplicates (ARI-3292).
 */
const concatExternalContents = (parentValue: any[], childValue: any[]): any[] =>
  uniqWith([...parentValue, ...childValue], isEqual);

/**
 * Merges parent and child i18n arrays by matching language (instead of by
 * index): matching languages are deep merged with externalContents
 * concatenated, parent-only languages are kept and child-only languages are
 * appended (ARI-3292).
 */
const mergeI18nByLanguage = (parentI18n: any[], childI18n: any[]): any[] => {
  const merged = parentI18n.map(parentLang => {
    const childLang = childI18n.find(c => c && c.language === (parentLang && parentLang.language));
    return childLang ? mergeWith({}, parentLang, childLang, parentMergerCustomizer) : parentLang;
  });
  const childOnlyLanguages = childI18n.filter(
    childLang => !parentI18n.some(p => p && p.language === (childLang && childLang.language))
  );
  return [...merged, ...childOnlyLanguages];
};

/**
 * lodash mergeWith customizer: externalContents arrays are concatenated (parent
 * first, deduplicated) and i18n entries are merged by language, instead of the
 * child overriding the parent. Any other key falls back to the default merge.
 */
const parentMergerCustomizer = (parentValue: any, childValue: any, key?: string): any => {
  if (key === 'externalContents' && isArray(parentValue) && isArray(childValue)) {
    return concatExternalContents(parentValue, childValue);
  }
  if (key === 'i18n' && isArray(parentValue) && isArray(childValue)) {
    return mergeI18nByLanguage(parentValue, childValue);
  }
  return undefined;
};

/**
 * Will be merged from 0 to last content
 * @param {Array<any>} override
 * @returns {{}}
 */
export const certificateParentMerger = (override: Array<any>):ArianeeCertificatei18nV3 => {
  const content = {};
  override.forEach(d => {
    mergeWith(content, d, parentMergerCustomizer);
  });

  return content as ArianeeCertificatei18nV3;
};
