import { container } from 'tsyringe';
import Web3 from 'web3';
import { provider } from 'web3-core';
import * as conf from '../../configurations';
import { ArianeeConfig, TransactionOptions } from '../../models/arianeeConfiguration';
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

  public async init (
    networkName: NETWORK = NETWORK.testnet,
    arianeeCustomConfiguration:{
      walletReward?: { address: string },
      brandDataHubReward?: { address: string },
      httpProvider?:provider,
      transactionOptions?: TransactionOptions,
      deepLink?:string
    } = {}
  ): Promise<ArianeeWalletBuilder> {
    const url = networkURL[networkName];

    const arianeeConfiguration: ArianeeConfig = {
    } as ArianeeConfig;

    const addressesResult = await ArianeeHttpClient.fetch(url).catch(err => console.error(`${url} not working`));

    Object.keys(addressesResult.contractAdresses).forEach(contractName => {
      const contractAddress = addressesResult.contractAdresses[contractName];
      try {
        arianeeConfiguration[contractName] = { abi: conf[contractName], address: contractAddress };
      } catch (e) {
        console.warn(`this contract is not working ${contractName}`);
      }
    });

    const { deepLink, faucetUrl } = conf.appConfig[networkName];

    arianeeConfiguration.faucetUrl = faucetUrl;

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

  public setDefaultQuery (value: ConsolidatedCertificateRequest) {
    this.globalConfigurationService.setDefaultQuery(value);
    return this;
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
