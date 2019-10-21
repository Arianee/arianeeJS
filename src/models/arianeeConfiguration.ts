export interface Contract {
  abi: string;
  address: string;
}

export interface ArianeeConfig {
  aria: Contract;
  creditHistory: Contract;
  eventArianee: Contract;
  identity: Contract;
  smartAsset: Contract;
  staking: Contract;
  store: Contract;
  whitelist: Contract;

  provider: string;
  chainId: number;
  faucetUrl: string;
  walletReward: { address: string };
  brandDataHubReward: { address: string };
  deepLink: string;
}
