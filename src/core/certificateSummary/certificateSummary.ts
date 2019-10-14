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

interface ArianeeEvents {

}
export interface CertificiateContent {
  isAuthentic: boolean;
  data: CertificateContent;
}

export interface CertificateIssuer {
  isIdentityAuthentic: boolean;
  isIdentityVerified: boolean;
  identity: any;
}

export interface CertificateOwner {
  isOwner: boolean;
  publicKey: string;
  identity?: any
}

export interface CertificateEvents {
  transfert?: any[];
  arianeeEvents?: any[];
  all: any[];
}

export interface CertificateAdvanced {
  tokenRecoveryDate: string;
}

export interface CertificateSummary {
  content?: CertificiateContent;
  isTransferable?: boolean;
  issuer?: CertificateIssuer;
  owner?: CertificateOwner;
  events?: CertificateEvents;
  advanced?: CertificateAdvanced;
}

export interface ConsolidatedQuery {
  query: {
    limit: number;
    order: string
  };
}

export interface ConsolidatedArianeeEventsRequest {
  query: ConsolidatedQuery;
  transfert: boolean | ConsolidatedQuery;
  arianeeEvents: boolean | ConsolidatedQuery;
}

export interface ConsolidatedCertificateRequest {
  isTransferable?: boolean;
  content?: boolean;
  issuer?: boolean;
  owner?: boolean;
  events?: boolean | ConsolidatedArianeeEventsRequest;
  arianeeEvents?: boolean | ConsolidatedArianeeEventsRequest;
  advanced?: boolean;
}