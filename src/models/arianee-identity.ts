export interface IdentitySummary<IdentityType=any> {
  data: IdentityType;
  isAuthentic: boolean;
  isApproved: boolean;
  address: string;
  imprint:string;
}
