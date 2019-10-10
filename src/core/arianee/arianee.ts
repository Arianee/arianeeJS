import * as conf from "../../configuration";
import { appConfig } from "../../configuration";
import { ProtocolConfigurationBuilder } from "../protocolConfigurationBuilder/protocolConfigurationBuilder";
import { ArianeeWalletBuilder } from "../wallet/walletBuilder";
import { ArianeeHttpClient } from "../servicesHub/services/arianeeHttpClient";
import { networkURL, NETWORK } from "../../models/networkConfiguration";

export class Arianee {

    async connectToProtocol(networkName: NETWORK = NETWORK.testnet): Promise<ArianeeWalletBuilder> {
        const url = networkURL[networkName];

        const addressesResult = await ArianeeHttpClient.fetch(url);

        const protocolConfigurationBuilder = new ProtocolConfigurationBuilder()

        Object.keys(addressesResult.contractAdresses)
            .forEach(contractName => {
                const contractAddress = addressesResult.contractAdresses[contractName];
                protocolConfigurationBuilder.setSmartContractConfiguration(contractName, conf[contractName], contractAddress)
            })

        protocolConfigurationBuilder.setDeepLink(appConfig.deepLink);
        protocolConfigurationBuilder.setFaucetUrl(appConfig.faucetUrl);
        
        protocolConfigurationBuilder.setWeb3HttpProvider(addressesResult.httpProvider, addressesResult.chainId);

        return protocolConfigurationBuilder
            .build();
    }
}