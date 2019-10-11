import * as conf from "../../configuration";
import { appConfig } from "../../configuration";
import { NETWORK, networkURL } from "../../models/networkConfiguration";
import { ProtocolConfigurationBuilder } from "../protocolConfigurationBuilder/protocolConfigurationBuilder";
import { ArianeeHttpClient } from "../servicesHub/services/arianeeHttpClient";
import { ArianeeWalletBuilder } from "../wallet/walletBuilder";

export class Arianee {

    async connectToProtocol(networkName: NETWORK = NETWORK.testnet): Promise<ArianeeWalletBuilder> {
        const url = networkURL[networkName];

        const addressesResult = await ArianeeHttpClient.fetch(url);

        const protocolConfigurationBuilder = new ProtocolConfigurationBuilder();

        Object.keys(addressesResult.contractAdresses)
            .forEach(contractName => {
                const contractAddress = addressesResult.contractAdresses[contractName];
                protocolConfigurationBuilder
                    .setSmartContractConfiguration(
                        contractName,
                        conf[contractName],
                        contractAddress);
            });

        protocolConfigurationBuilder.setDeepLink(appConfig.deepLink);
        protocolConfigurationBuilder.setFaucetUrl(appConfig.faucetUrl);

        protocolConfigurationBuilder.setWeb3HttpProvider(addressesResult.httpProvider, addressesResult.chainId);

        return protocolConfigurationBuilder
            .build();
    }
}