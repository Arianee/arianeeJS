export interface IdentitySummary {
  data: IdentityContent;
  isAuthentic: boolean;
  isApproved: boolean;
  address: string;
}

export interface Picture {
  type: string;
  url: string;
}

export interface IdentityContent {
  $schema: string;
  name: string;
  companyName: string;
  description: string;
  arianeeMembership: string;
  pictures: Picture[];
  rpcEndpoint: string;
}
