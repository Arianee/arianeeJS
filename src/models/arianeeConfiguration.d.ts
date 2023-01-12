import { provider } from 'web3-core';
import { ArianeeHttpClient } from '../core/libs/arianeeHttpClient/arianeeHttpClient';
import { NETWORK } from './networkConfiguration';
import { ContractAddressConvention } from './contractAddress';

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
  message:ContractConfiguration;
  userAction:ContractConfiguration;

  networkName:NETWORK;
  web3Provider: provider;
  chainId: number;
  faucetUrl: string;
  walletReward: { address: string };
  brandDataHubReward: { address: string };
  gasStationURL?:string;
  deepLink: string;
  alternativeDeeplink: string[];
  transactionOptions?:TransactionOptions,
  defaultArianeePrivacyGateway?:string,

  contractAddresses:ContractAddressConvention,
  arianeeHttpClient:ArianeeHttpClient,
  protocolVersion?:number,
  blockchainProxy?:{
    enable:boolean,
    host?:string
  },
  jwtGetter:(arianeeAccessToken:string)=>Promise<any>
}
