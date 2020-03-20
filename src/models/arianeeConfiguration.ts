import { provider } from 'web3-core';

interface ContractConfiguration {
  abi: string;
  address: string;

}

export interface TransactionOptions {
  gas: number,
  gasPrice: any
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
  lost:ContractConfiguration;

  web3Provider: provider;
  chainId: number;
  faucetUrl: string;
  walletReward: { address: string };
  brandDataHubReward: { address: string };
  deepLink: string;
  transactionOptions?:TransactionOptions
}
