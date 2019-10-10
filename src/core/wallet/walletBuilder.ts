import { ethers, Wallet as etherWallet } from "ethers";
import { ArianeeConfig } from "../../models/arianeeConfiguration";
import { ArianeeWallet } from "./wallet";
import { ServicesHubBuilder } from "../servicesHub";

export class ArianeeWalletBuilder {
    private web3: any;

    readonly stateBuilder: ServicesHubBuilder = new ServicesHubBuilder();

    constructor(arianeeConfig: ArianeeConfig) {
        this.stateBuilder.setConfig(arianeeConfig);
        this.web3 = this.stateBuilder.contracts.web3;
    }

    private buildAriaWallet(account): ArianeeWallet {
        if (this.web3.utils.isAddress(account.address)) {
            const arianeeState = this.stateBuilder.build()
            return new ArianeeWallet(arianeeState, account);
        }
        throw new Error("invalid address");
    }

    public fromPassPhrase(passphrase: string): ArianeeWallet {
        let privateKey = this.web3.utils.padLeft(this.web3.utils.toHex(passphrase), 64);
        return this.fromPrivateKey(privateKey);
    }

    /**
     * From a randomKey and return ArianeeProtocol
     */
    public fromRandomKey(): ArianeeWallet {
        const randomWallet = etherWallet.createRandom();
        const account = this.web3.eth.accounts.privateKeyToAccount(randomWallet.privateKey);
        return this.buildAriaWallet(account);
    }

    /**
     * Generate a mnemonic and return ArianeeProtocol
     * @param data
     */
    public fromRandomMnemonic(data): ArianeeWallet {
        const mnemonic = this.generateMnemonic(data);
       return this.fromMnemonic(mnemonic);
    }

    /**
     *  From a mnemonic and return ArianeeProtocol
     * @param mnemonic
     */
    public fromMnemonic(mnemonic: string): ArianeeWallet {
        const isValidMnemonic = ethers.utils.HDNode.isValidMnemonic(mnemonic);
        if (isValidMnemonic) {
            const { privateKey } = etherWallet.fromMnemonic(mnemonic);
            const account = this.web3.eth.accounts.privateKeyToAccount(privateKey);
            return this.buildAriaWallet(account);
        } else {
            throw new Error("invalid mnemonic");
        }
    }

    /**
     *  From privatekey and return ArianeeProtocol
     * @param privateKey
     */
    public fromPrivateKey(privateKey: string): ArianeeWallet {
        const account = this.web3.eth.accounts.privateKeyToAccount(privateKey);
        return this.buildAriaWallet(account);
    }

    private generateMnemonic(data: string): string {
        if (data && data != "ko") {
            const encryptedKey = data;
            const mnemonic = JSON.parse(encryptedKey.toString()).signingKey.mnemonic;
            return mnemonic;
        } else {
            console.error("no data");
            return;
        }
    }

}
