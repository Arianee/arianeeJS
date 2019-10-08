import { isNullOrUndefined } from "util";
import { ArianeeConfig, Contract } from "../../models/ariaanee-config";
import { ArianeeWalletBuilder } from "../wallet/walletBuilder";

export class ProtocolConfigurationBuilder {
    private config: ArianeeConfig =
        {
            identity: { abi: undefined, address: undefined },
            token: { abi: undefined, address: undefined },
            store: { abi: undefined, address: undefined },
            aria: { abi: undefined, address: undefined },
            creditHistory: { abi: undefined, address: undefined },
            staking: { abi: undefined, address: undefined },
            whitelist: { abi: undefined, address: undefined },
            eventArianee:{abi:undefined,address:undefined},
            provider: undefined,
            chainId: undefined,
            faucetUrl: undefined,

            walletReward: { address: undefined },
            brandDataHubReward: { address: undefined },
        };

    public setConfig(val: any) {
        Object.assign(this.config, val);
        return this;
    }

    public setTokenAbi(val: any) {
        this.config.token.abi = val;
        return this;
    }

    public setAria(val: any) {
        this.config.aria.abi = val;
        return this;
    }

    public setIdentityAbi(val: any) {
        this.config.identity.abi = val;
        return this;
    }

    public setStoreAbi(val: any) {
        this.config.store.abi = val;
        return this;
    }

    public setCreditHistory(val: any) {
        this.config.creditHistory.abi = val;
        return this;
    }

    public setWhiteList(val: any) {
        this.config.whitelist.abi = val;
        return this;
    }

    public setStaking(val: any) {
        this.config.staking.abi = val;
        return this;
    }


    public setEventArianee(val: any) {
        this.config.eventArianee.abi = val;
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
        const properties = ["store", "aria", "token", "identity", "staking", "whitelist", "creditHistory"];
        const missingProperties = properties.filter((property) => isNullOrUndefined(this.config[property].abi));
        return {
            missingProperties,
            isValid: missingProperties.length === 0,
        };
    }
}
