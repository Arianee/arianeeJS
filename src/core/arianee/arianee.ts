import { container } from 'tsyringe';
import Web3 from 'web3';
import { provider } from 'web3-core';
import * as conf from '../../configurations';
import { ArianeeConfig, TransactionOptions } from '../../models/arianeeConfiguration';
import { HttpInterceptor } from '../../models/httpClient';
import { NETWORK, networkURL } from '../../models/networkConfiguration';
import { ArianeeHttpClient } from '../libs/arianeeHttpClient/arianeeHttpClient';
import { Store } from '../libs/simpleStore/store';
import { ConsolidatedCertificateRequest } from '../wallet/certificateSummary/certificateSummary';
import { GlobalConfigurationService } from '../wallet/services/globalConfigurationService/globalConfigurationService';
import { ArianeeWalletBuilder } from '../wallet/walletBuilder';
import { get } from 'lodash';

export class Arianee {
  public globalConfigurationService: GlobalConfigurationService;

  constructor () {
    this.globalConfigurationService = container.resolve(GlobalConfigurationService);
  }

  public fromCustomConfiguration () {

  }

  public async init (
    networkName: NETWORK = NETWORK.testnet,
    arianeeCustomConfiguration:{
      walletReward?: { address: string },
      brandDataHubReward?: { address: string },
      httpProvider?:provider,
      transactionOptions?: TransactionOptions,
      deepLink?:string,
      gasStation?:string,
      protocolConfiguration?:any,
      defaultArianeePrivacyGateway?:string,
      httpInterceptor?:HttpInterceptor,
      httpFetch?:(url, config)=>Promise<any>,
      blockchainProxy?:{
        enable:boolean,
        host?:string
      },
      jwtGetter?:(arianeeAccessToken:string)=>Promise<any>,
      faucetUrl?:string
    } = {}
  ): Promise<ArianeeWalletBuilder> {
    const arianeeConfiguration: ArianeeConfig = {
    } as ArianeeConfig;

    arianeeConfiguration.arianeeHttpClient = new ArianeeHttpClient();
    if (arianeeCustomConfiguration.httpInterceptor) {
      arianeeConfiguration
        .arianeeHttpClient
        .setRequestInterceptor(arianeeCustomConfiguration.httpInterceptor.httpRequestInterceptor);
    }

    if (arianeeCustomConfiguration.httpFetch) {
      arianeeConfiguration
        .arianeeHttpClient
        .setHttpFetch(arianeeCustomConfiguration.httpFetch);
    }

    let addressesResult;
    if (get(arianeeCustomConfiguration, 'protocolConfiguration')) {
      addressesResult = get(arianeeCustomConfiguration, 'protocolConfiguration');
    } else {
      const url = networkURL[networkName];
      addressesResult = await arianeeConfiguration.arianeeHttpClient.fetch(url).catch(err => console.error(`${url} not working`));
    }

    const { deepLink, faucetUrl, alternativeDeeplink, networkName: currentNetworkName, protocolVersion } = conf.appConfig[networkName];

    arianeeConfiguration.faucetUrl = faucetUrl;
    arianeeConfiguration.alternativeDeeplink = alternativeDeeplink;
    arianeeConfiguration.networkName = currentNetworkName;
    arianeeConfiguration.protocolVersion = protocolVersion;
    arianeeConfiguration.contractAddresses = addressesResult;
    arianeeConfiguration.isSoulbound = addressesResult.soulbound ?? false;

    arianeeConfiguration.defaultArianeePrivacyGateway = arianeeCustomConfiguration.defaultArianeePrivacyGateway;

    Object.keys(addressesResult.contractAdresses).forEach(contractName => {
      const contractAddress = addressesResult.contractAdresses[contractName];
      try {
        arianeeConfiguration[contractName] = { abi: conf.contracts[arianeeConfiguration.protocolVersion][contractName], address: contractAddress };
      } catch (e) {
        console.warn(`this contract is not working ${contractName}`);
      }
    });
    arianeeConfiguration.gasStationURL = arianeeCustomConfiguration.gasStation || addressesResult.gasStation;

    arianeeConfiguration.web3Provider = (function () {
      if (arianeeCustomConfiguration.httpProvider) {
        return arianeeCustomConfiguration.httpProvider;
      } else {
        if (typeof addressesResult.httpProvider === 'string') {
          return addressesResult.httpProvider;
        } else {
          const HttpProviderConstructor:any = Web3.providers.HttpProvider as any;
          return new HttpProviderConstructor(...addressesResult.httpProvider);
        }
      }
    })();

    if (get(arianeeCustomConfiguration, 'transactionOptions')) {
      arianeeConfiguration.transactionOptions = get(arianeeCustomConfiguration, 'transactionOptions');
    }

    arianeeConfiguration.chainId = addressesResult.chainId;

    if (get(arianeeCustomConfiguration, 'deepLink')) {
      arianeeConfiguration.deepLink = get(arianeeCustomConfiguration, 'deepLink');
    } else {
      arianeeConfiguration.deepLink = deepLink;
    }

    if (get(arianeeCustomConfiguration, 'walletReward.address')) {
      arianeeConfiguration.walletReward = arianeeCustomConfiguration.walletReward;
    }

    if (get(arianeeCustomConfiguration, 'brandDataHubReward.address')) {
      arianeeConfiguration.brandDataHubReward = arianeeCustomConfiguration.brandDataHubReward;
    }
    arianeeConfiguration.blockchainProxy = arianeeCustomConfiguration.blockchainProxy;

    if (arianeeCustomConfiguration.jwtGetter) {
      arianeeConfiguration.jwtGetter = arianeeCustomConfiguration.jwtGetter;
    }

    if (arianeeCustomConfiguration.faucetUrl) {
      arianeeConfiguration.faucetUrl = arianeeCustomConfiguration.faucetUrl;
    }

    return new ArianeeWalletBuilder(arianeeConfiguration);
  }

  /**
   * @deprecated this method has been renamed setStore.
   */
  public setCache (storageObject: any)
    : Arianee {
    console.error('setCache method does not exist anymore. Please use setStore');

    return this;
  }

  /**
     * @deprecated this method is available in ArianeeWallet class
     */
  public setDefaultQuery (value: ConsolidatedCertificateRequest) {
    throw new Error('this method has been deprecated: this method is available in ArianeeWallet class (wallet.setDefaultQuery)');
  }

  public setStore (storageObject: { getStoreItem: (storeKey: string) => Promise<any>, hasItem: (storeKey: string) => Promise<boolean>, setStoreItem: (keyl: string, value: any) => Promise<any> }) {
    container.register(Store, { useValue: storageObject });

    return this;
  }

  /**
   * @deprecated this method has been renamed init.
   */
  public connectToProtocol = (args?) => this.init(args);
}
