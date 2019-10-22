import * as conf from "../../configurations";
import { appConfig } from "../../configurations";
import { NETWORK, networkURL } from "../../models/networkConfiguration";
import { ProtocolConfigurationBuilder } from "../protocolConfigurationBuilder/protocolConfigurationBuilder";
import { ArianeeHttpClient } from "../servicesHub/services/arianeeHttpClient";
import { ArianeeWalletBuilder } from "../wallet/walletBuilder";

export class Arianee {
  public async init (
    networkName: NETWORK = NETWORK.testnet
  ): Promise<ArianeeWalletBuilder> {
    const url = networkURL[networkName];

    const addressesResult = await ArianeeHttpClient.fetch(url);

    const protocolConfigurationBuilder = new ProtocolConfigurationBuilder();

    Object.keys(addressesResult.contractAdresses).forEach(contractName => {
      const contractAddress = addressesResult.contractAdresses[contractName];
      protocolConfigurationBuilder.setSmartContractConfiguration(
        contractName,
        conf[contractName],
        contractAddress
      );
    });

    const { deepLink, faucetUrl } = appConfig[networkName];

    protocolConfigurationBuilder.setDeepLink(deepLink);
    protocolConfigurationBuilder.setFaucetUrl(faucetUrl);

    protocolConfigurationBuilder.setWeb3HttpProvider(
      addressesResult.httpProvider,
      addressesResult.chainId
    );

    return protocolConfigurationBuilder.build();
  }

  /**
   * @deprecated this method has been renamed init.
   */
  public connectToProtocol = (args?) => this.init(args);
}
