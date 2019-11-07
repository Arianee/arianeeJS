import { IdentitySummary } from './arianee-identity';

export interface BlockchainEvent{
  address: string;
  blockHash: string;
  blockNumber: number;
  data?: string;
  logIndex: number;
  removed?: boolean;
  topics?: string[];
  transactionHash: string;
  transactionIndex: number;
  transactionLogIndex?: number;
  type?: string;
  content?: EventContent;
  timestamp?: number;
  returnValues:any;
}

export interface ArianeeEventContent{
  content?: EventContent;
  identity?: IdentitySummary;
  timestamp?: number;
  id: number;
  pending?:boolean;
}

export interface EventContent {
  $schema: string;
  eventType: string;
  language?: string;
  title: string;
  description?: string;
  externalContents?: ExternalContent[];
  i18n?: I18n[];
  medias?: ArianeeMedia[];
  attributes?: EventAttribute[];
  valuePrice?: string;
  currencyPrice?: string;
  location?: string;
}

export interface ExternalContent{
  title:string;
  url:string;
  order?:number;
}
export interface I18n{
  language:string;
  title:string;
  description?:string;
  externalContents?:ExternalContent[];
}

export interface ArianeeMedia{
  mediaType:string;
  type:string;
  url: string;
  hash?: string;
  order?:number;
}

export interface EventAttribute{
  type:string;
  value:string;
}
