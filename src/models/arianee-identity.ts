export interface IdentitySummary {
  data: IdentityContent;
  isAuthentic: boolean;
  isApproved: boolean;
}

export interface Schema {
  title: string;
  type: string;
  default: string;
  widget: string;
}

export interface Name {
  type: string;
  title: string;
  description: string;
}

export interface CompanyName {
  type: string;
  title: string;
  description: string;
}

export interface ParentCompanyName {
  type: string;
  title: string;
  description: string;
}

export interface Widget {
  id: string;
}

export interface Description {
  type: string;
  title: string;
  description: string;
  widget: Widget;
}

export interface Widget2 {
  id: string;
}

export interface OneOf {
  enum: string[];
  title: string;
  description: string;
}

export interface Type {
  type: string;
  title: string;
  widget: Widget2;
  oneOf: OneOf[];
}

export interface Widget3 {
  id: string;
}

export interface Title {
  type: string;
  title: string;
  widget: Widget3;
}

export interface Widget4 {
  id: string;
}

export interface Url {
  type: string;
  title: string;
  widget: Widget4;
}

export interface Properties2 {
  type: Type;
  title: Title;
  url: Url;
}

export interface Items {
  type: string;
  title: string;
  properties: Properties2;
}

export interface ExternalContents {
  type: string;
  title: string;
  description: string;
  items: Items;
}

export interface Widget5 {
  id: string;
}

export interface OneOf2 {
  enum: string[];
  title: string;
  description: string;
}

export interface Language {
  type: string;
  title: string;
  widget: Widget5;
  oneOf: OneOf2[];
}

export interface Widget6 {
  id: string;
}

export interface Description2 {
  type: string;
  title: string;
  widget: Widget6;
}

export interface Widget7 {
  id: string;
}

export interface OneOf3 {
  enum: string[];
  title: string;
  description: string;
}

export interface Type2 {
  type: string;
  title: string;
  widget: Widget7;
  oneOf: OneOf3[];
}

export interface Widget8 {
  id: string;
}

export interface Title2 {
  type: string;
  title: string;
  widget: Widget8;
}

export interface Widget9 {
  id: string;
}

export interface Url2 {
  type: string;
  title: string;
  widget: Widget9;
}

export interface Properties4 {
  type: Type2;
  title: Title2;
  url: Url2;
}

export interface Items3 {
  type: string;
  title: string;
  properties: Properties4;
}

export interface ExternalContents2 {
  type: string;
  title: string;
  description: string;
  items: Items3;
}

export interface Properties3 {
  language: Language;
  description: Description2;
  externalContents: ExternalContents2;
}

export interface Items2 {
  type: string;
  properties: Properties3;
}

export interface Descriptioni18n {
  type: string;
  title: string;
  description: string;
  items: Items2;
}

export interface Widget10 {
  id: string;
}

export interface OneOf4 {
  enum: string[];
  title: string;
  description: string;
}

export interface ArianeeMembership {
  type: string;
  title: string;
  description: string;
  widget: Widget10;
  oneOf: OneOf4[];
}

export interface StreetAddress {
  type: string;
  title: string;
}

export interface StreetAddress2 {
  type: string;
  title: string;
}

export interface Zipcode {
  type: string;
  title: string;
}

export interface City {
  type: string;
  title: string;
}

export interface State {
  type: string;
  title: string;
}

export interface Country {
  type: string;
  title: string;
}

export interface Properties5 {
  street_address: StreetAddress;
  street_address2: StreetAddress2;
  zipcode: Zipcode;
  city: City;
  state: State;
  country: Country;
}

export interface Address {
  type: string;
  title: string;
  description: string;
  properties: Properties5;
}

export interface Name2 {
  title: string;
  type: string;
}

export interface Email {
  title: string;
  type: string;
}

export interface Title3 {
  title: string;
  type: string;
}

export interface Widget11 {
  id: string;
}

export interface OneOf5 {
  enum: string[];
  title: string;
  description: string;
}

export interface Type3 {
  title: string;
  type: string;
  widget: Widget11;
  oneOf: OneOf5[];
}

export interface Properties6 {
  name: Name2;
  email: Email;
  title: Title3;
  type: Type3;
}

export interface Items4 {
  title: string;
  type: string;
  properties: Properties6;
}

export interface Contacts {
  description: string;
  type: string;
  title: string;
  items: Items4;
}

export interface Widget12 {
  id: string;
}

export interface OneOf6 {
  enum: string[];
  title: string;
  description: string;
}

export interface Type4 {
  type: string;
  title: string;
  widget: Widget12;
  oneOf: OneOf6[];
}

export interface Widget13 {
  id: string;
}

export interface Url3 {
  type: string;
  title: string;
  widget: Widget13;
}

export interface Widget14 {
  id: string;
}

export interface Hash {
  type: string;
  title: string;
  widget: Widget14;
}

export interface Properties7 {
  type: Type4;
  url: Url3;
  hash: Hash;
}

export interface Items5 {
  type: string;
  properties: Properties7;
}

export interface Pictures {
  type: string;
  title: string;
  description: string;
  items: Items5;
}

export interface Widget15 {
  id: string;
}

export interface OneOf7 {
  enum: string[];
  title: string;
  description: string;
}

export interface Type5 {
  type: string;
  title: string;
  widget: Widget15;
  oneOf: OneOf7[];
}

export interface Widget16 {
  id: string;
}

export interface Value {
  type: string;
  title: string;
  widget: Widget16;
}

export interface Properties8 {
  type: Type5;
  value: Value;
}

export interface Items6 {
  type: string;
  properties: Properties8;
}

export interface Socialmedia {
  type: string;
  title: string;
  description: string;
  items: Items6;
}

export interface IdentityContent {
  $schema: Schema;
  name: Name;
  companyName: CompanyName;
  parentCompanyName: ParentCompanyName;
  description: Description;
  externalContents: ExternalContents;
  descriptioni18n: Descriptioni18n;
  arianeeMembership: ArianeeMembership;
  address: Address;
  contacts: Contacts;
  pictures: Pictures;
  socialmedia: Socialmedia;
  rpcEndpoint: string;
}
