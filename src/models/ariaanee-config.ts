
export interface Contract {
  abi: string;
  address: string;
}

export interface ArianeeConfig {
  identity: Contract;
  token: Contract;
  creditHistory: Contract;
  staking: Contract;
  whitelist: Contract;
  store: Contract;
  aria: Contract;
  eventArianee: Contract,
  provider: string;
  chainId: number;
  faucetUrl: string;
  walletReward: { address: string };
  brandDataHubReward: { address: string };
  deepLink: string;
}


