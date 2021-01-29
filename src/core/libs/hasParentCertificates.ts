import { GenericJsonSchema } from '../../models/jsonSchema/certificates/ArianeeProducti18n';

export const hasParentCertificate = (certif:GenericJsonSchema): boolean => {
  return certif.parentCertificates && certif.parentCertificates.length > 0;
};
