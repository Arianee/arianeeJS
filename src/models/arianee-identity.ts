export interface IdentityBase<IdentityType=any> {
  data: IdentityType;
  address: string;
}

export interface IdentitySummary<IdentityType=any> extends IdentityBase{
  isAuthentic: boolean;
  isApproved: boolean;
  imprint:string;
}
