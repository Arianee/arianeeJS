import { IdentitySummary } from '../../../models/arianee-identity';
import { sortEvents } from '../../libs/sortEvents';

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

export interface CertificateContentContainer {
  isAuthentic: boolean;
  data: CertificateContent;
}

export interface CertificateIssuer {
  isIdentityAuthentic: boolean;
  isIdentityVerified: boolean;
  identity: IdentitySummary;
}

export interface CertificateOwner {
  isOwner: boolean;
  publicKey: string;
  identity?: IdentitySummary;
}

export interface CertificateEvents {
  transfer?: any[];
  arianeeEvents?: any[];
  all?: any[];
}

export class CertificateEventsSummary implements CertificateEvents {
  public transfer = [];
  public arianeeEvents = [];

  get all () {
    return [...this.transfer, ...this.arianeeEvents].sort(sortEvents);
  }
}

export interface CertificateAdvanced {
  tokenRecoveryDate: string;
}

export interface CertificateSummary {
  certificateId: string;
  content?: CertificateContentContainer;
  isRequestable?: boolean;
  issuer?: CertificateIssuer;
  owner?: CertificateOwner;
  events?: CertificateEvents;
  advanced?: CertificateAdvanced;
  messageSenders?:{
    [key:string]:boolean
  }
}

export interface ConsolidatedIssuerRequestInterface {
  waitingIdentity?: boolean;
  forceRefresh?:boolean;
}

export type ConsolidatedIssuerRequest = ConsolidatedIssuerRequestInterface | boolean;

export interface ConsolidatedCertificateRequest {
  isRequestable?: boolean;
  content?: boolean;
  issuer?: ConsolidatedIssuerRequest;
  owner?: boolean;
  events?: boolean;
  arianeeEvents?: boolean;
  advanced?: boolean;
  messageSenders?:boolean
}
