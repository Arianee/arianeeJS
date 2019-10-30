interface ContractConfiguration {
  abi: string;
  address: string;

}

export interface ArianeeConfig {
  aria: ContractConfiguration;
  creditHistory: ContractConfiguration;
  eventArianee: ContractConfiguration;
  identity: ContractConfiguration;
  smartAsset: ContractConfiguration;
  staking: ContractConfiguration;
  store: ContractConfiguration;
  whitelist: ContractConfiguration;

  provider: string;
  chainId: number;
  faucetUrl: string;
  walletReward: { address: string };
  brandDataHubReward: { address: string };
  deepLink: string;
}
