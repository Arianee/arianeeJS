export interface Serialnumber {
  type: string;
  value: string;
}

export interface Picture {
  src: string;
}

export interface Socialmedia {
  instagram: string;
  twitter: string;
}

export interface ExternalContent {
  title: string;
  url: string;
  backgroundColor: string;
  color: string;
}

export interface CertificateContent {
  $schema: string;
  name: string;
  v: string;
  serialnumber: Serialnumber[];
  brand: string;
  model: string;
  description: string;
  type: string;
  picture: string;
  pictures: Picture[];
  socialmedia: Socialmedia;
  externalContents: ExternalContent[];
  jsonSurcharger: string;
}

export interface CertificateSummary {
  content: CertificateContent;
  isCertificateValid: boolean;
  isIssuerValid: boolean;
  isIssuerExist: boolean;
  isIssuerIdentity: boolean;
  owner: string;
  isOwner: boolean;
}