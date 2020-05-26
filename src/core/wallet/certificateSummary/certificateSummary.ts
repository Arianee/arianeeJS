import { IdentitySummary } from '../../../models/arianee-identity';
import { EventContent } from '../../../models/blockchainEvent';
import { ArianeeTokenId } from '../../../models/ArianeeTokenId';
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

export interface CertificateContentContainer<CertificateType=CertificateContent> {
  isAuthentic: boolean;
  imprint:string;
  data: CertificateType;
}

export interface CertificateIssuer<IdentityType=any> {
  imprint:string;
  isIdentityAuthentic: boolean;
  isIdentityVerified: boolean;
  identity: IdentitySummary<IdentityType>;
}

export interface CertificateOwner {
  isOwner: boolean;
  publicKey: string;
  address: string;
  identity?: IdentitySummary;
}

export interface ArianeeEvent<EventType=any, IdentityType=any>{
  certificateId: ArianeeTokenId;
  arianeeEventId:ArianeeTokenId;
  content: CertificateContentContainer<EventType>;
  issuer: CertificateIssuer<IdentityType>;
  timestamp:number;
  pending:boolean;
}

export interface Message<MessageType=any, IdentityType=any>{
  certificateId: ArianeeTokenId;
  messageId:ArianeeTokenId;
  content: CertificateContentContainer<MessageType>;
  issuer: CertificateIssuer<IdentityType>;
  to:string;
}

export interface CertificateEvents {
  transfer?: any[];
  arianeeEvents?: ArianeeEvent[];
  all?: CertificateContentContainer<EventContent>[];
}

export class CertificateEventsSummary implements CertificateEvents {
  public transfer = [];
  public arianeeEvents = [];

  get all () {
    return [...this.transfer, ...this.arianeeEvents].sort(sortEvents);
  }
}

export interface CertificateAdvanced {
  tokenRecoveryDate?: string;
  languages?:string[]
}

export interface CertificateSummary<CertificateType=any, IdentityType=any> {
  certificateId: ArianeeTokenId;
  content?: CertificateContentContainer<CertificateType>;
  isRequestable?: boolean;
  issuer?: CertificateIssuer<IdentityType>;
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
  rpcURI?:string
}

export type ConsolidatedIssuerRequest = ConsolidatedIssuerRequestInterface | boolean;

export interface ConsolidatedCertificateRequest {
  isRequestable?: boolean;
  content?: boolean;
  issuer?: ConsolidatedIssuerRequest;
  owner?: boolean;
  events?: boolean;
  arianeeEvents?: boolean;
  advanced?: CertificateAdvanced;
  messageSenders?:boolean
}
