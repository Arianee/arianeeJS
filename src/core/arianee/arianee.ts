import {container} from "tsyringe";
import * as conf from "../../configurations";
import {appConfig} from "../../configurations";
import {NETWORK, networkURL} from "../../models/networkConfiguration";
import {ArianeeHttpClient} from "../libs/arianeeHttpClient/arianeeHttpClient";
import {SimpleSessionCache} from "../libs/simpleCache/simpleSessionCache";
import {ArianeeWalletBuilder} from "../wallet/walletBuilder";
import {ProtocolConfigurationBuilder} from "./protocolConfigurationBuilder/protocolConfigurationBuilder";

export class Arianee {
    public async init (
        networkName: NETWORK = NETWORK.testnet
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

        const {deepLink, faucetUrl} = appConfig[networkName];

        protocolConfigurationBuilder.setDeepLink(deepLink);
        protocolConfigurationBuilder.setFaucetUrl(faucetUrl);

        protocolConfigurationBuilder.setWeb3HttpProvider(
            addressesResult.httpProvider,
            addressesResult.chainId
        );

        return protocolConfigurationBuilder.build();
    }

    public setCache (
        storageObject: { get: (key: string) => Promise<string>, set: (key: string, value: string) => Promise<any> })
        : Arianee {
        container.register(SimpleSessionCache, {useValue: storageObject});

        return this;
    }

    /**
     * @deprecated this method has been renamed init.
     */
    public connectToProtocol = (args?) => this.init(args);
}
