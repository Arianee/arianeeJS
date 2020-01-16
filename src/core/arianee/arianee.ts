import { container } from 'tsyringe';
import * as conf from '../../configurations';
import { NETWORK, networkURL } from '../../models/networkConfiguration';
import { ArianeeHttpClient } from '../libs/arianeeHttpClient/arianeeHttpClient';
import { Store } from '../libs/simpleStore/store';
import { ConsolidatedCertificateRequest } from '../wallet/certificateSummary/certificateSummary';
import { GlobalConfigurationService } from '../wallet/services/globalConfigurationService/globalConfigurationService';
import { ArianeeWalletBuilder } from '../wallet/walletBuilder';
import { ProtocolConfigurationBuilder } from './protocolConfigurationBuilder/protocolConfigurationBuilder';

export class Arianee {
  public globalConfigurationService: GlobalConfigurationService;

  constructor () {
    this.globalConfigurationService = container.resolve(GlobalConfigurationService);
  }

  public async init (
    networkName: NETWORK = NETWORK.testnet,
    arianeeCustomConfiguration:{
      walletReward?: { address: string },
      brandDataHubReward?: { address: string }
    } = {}
  ): Promise<ArianeeWalletBuilder> {
    const url = networkURL[networkName];

    const addressesResult = await ArianeeHttpClient.fetch(url).catch(err => console.error(`${url} not working`));

    const protocolConfigurationBuilder = new ProtocolConfigurationBuilder();

    Object.keys(addressesResult.contractAdresses).forEach(contractName => {
      const contractAddress = addressesResult.contractAdresses[contractName];
      try {
        protocolConfigurationBuilder.setSmartContractConfiguration(
          contractName,
          conf[contractName],
          contractAddress
        );
      } catch (e) {
        console.error(`this contract is not working ${contractName}`);
      }
    });

    const { deepLink, faucetUrl } = conf.appConfig[networkName];

    protocolConfigurationBuilder.setDeepLink(deepLink);
    protocolConfigurationBuilder.setFaucetUrl(faucetUrl);

    protocolConfigurationBuilder.setWeb3HttpProvider(
      addressesResult.httpProvider,
      addressesResult.chainId
    );

    if (arianeeCustomConfiguration.walletReward && arianeeCustomConfiguration.walletReward.address) {
      protocolConfigurationBuilder.setWalletReward(arianeeCustomConfiguration.walletReward.address);
    }

    if (arianeeCustomConfiguration.brandDataHubReward && arianeeCustomConfiguration.brandDataHubReward.address) {
      protocolConfigurationBuilder.setBrandDataHubReward(arianeeCustomConfiguration.brandDataHubReward.address);
    }

    return protocolConfigurationBuilder.build();
  }

  /**
   * @deprecated this method has been renamed init.
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
