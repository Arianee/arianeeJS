import { isNullOrUndefined } from "util";
import { ArianeeConfig, Contract } from "../../models/arianeeConfiguration";
import { ArianeeWalletBuilder } from "../wallet/walletBuilder";

export class ProtocolConfigurationBuilder {

    private config: ArianeeConfig =
        {
            identity: { abi: undefined, address: undefined },
            store: { abi: undefined, address: undefined },
            aria: { abi: undefined, address: undefined },
            creditHistory: { abi: undefined, address: undefined },
            staking: { abi: undefined, address: undefined },
            whitelist: { abi: undefined, address: undefined },
            eventArianee: { abi: undefined, address: undefined },
            smartAsset: { abi: undefined, address: undefined },
            provider: undefined,
            chainId: undefined,
            faucetUrl: undefined,
            deepLink: undefined,
            walletReward: { address: undefined },
            // TODO
            brandDataHubReward: { address: undefined },
        };

    public setSmartContractConfiguration(name: string, abi: object, address: string) {
        this.config[name].address = address;
        this.config[name].abi = abi;

        return this;
    }

    public setWeb3HttpProvider(provider: string, chainId: number) {
        this.config.provider = provider;
        this.config.chainId = chainId;

        return this;
    }
    public setDeepLink(deepLink: string) {
        this.config.deepLink = deepLink;

        return this;
    }

    public setFaucetUrl(faucetUrl: string) {
        this.config.faucetUrl = faucetUrl;

        return this;
    }

    public build(): ArianeeWalletBuilder {
        if (this.isReadyForBuild().isValid) {
            const arianeeProtocol = new ArianeeWalletBuilder(this.config);

            return arianeeProtocol;
        } else {
            throw new Error(`It is missing some settings: ${this.isReadyForBuild().missingProperties.join(" ")}`);
        }
    }

    public isReadyForBuild(): { missingProperties: string[], isValid: boolean } {
        const properties = ['provider', 'chainId'];
        const missingProperties = properties.filter((property) => isNullOrUndefined(this.config[property]));
        const contracts = ["store", "aria", "smartAsset", "identity", "staking", "whitelist", "creditHistory"];
        const missingAbi = contracts
            .filter(
                (property) =>
                    isNullOrUndefined(this.config[property].abi)
                    || isNullOrUndefined(this.config[property].address));
                    
        return {
            missingProperties: [...missingAbi, ...missingProperties],
            isValid: [...missingAbi, ...missingProperties].length === 0,
        };
    }
}
