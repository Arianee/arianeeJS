import { ethers, Wallet as etherWallet } from "ethers";
import { ArianeeConfig } from "../../models/ariaanee-config";
import { ArianeeWallet } from "./wallet";
import { ServicesHubBuilder } from "../servicesHub";

export class ArianeeWalletBuilder {
    private account: any;
    private web3: any;

    readonly stateBuilder: ServicesHubBuilder = new ServicesHubBuilder();

    constructor(arianeeConfig: ArianeeConfig) {
        this.stateBuilder.setConfig(arianeeConfig);
        this.web3 = this.stateBuilder.contracts.web3;
    }

    private buildAriaWallet(): ArianeeWallet {
        if (this.web3.utils.isAddress(this.account.address)) {
            const arianeeState = this.stateBuilder.build()
            return new ArianeeWallet(arianeeState, this.account);
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
        this.account = this.web3.eth.accounts.privateKeyToAccount(randomWallet.privateKey);
        return this.buildAriaWallet();
    }

    /**
     * Generate a mnemonic and return ArianeeProtocol
     * @param data
     */
    public fromRandomMnemonic(data): ArianeeWallet {
        const mnemonic = this.generateMnemonic(data);
        this.fromMnemonic(mnemonic);
        return this.buildAriaWallet();
    }

    /**
     *  From a mnemonic and return ArianeeProtocol
     * @param mnemonic
     */
    public fromMnemonic(mnemonic: string): ArianeeWallet {
        const isValidMnemonic = ethers.utils.HDNode.isValidMnemonic(mnemonic);
        if (isValidMnemonic) {
            const { privateKey } = etherWallet.fromMnemonic(mnemonic);
            this.account = this.web3.eth.accounts.privateKeyToAccount(privateKey);
        } else {
            throw new Error("invalid mnemonic");
        }
        return this.buildAriaWallet();
    }

    /**
     *  From privatekey and return ArianeeProtocol
     * @param privateKey
     */
    public fromPrivateKey(privateKey: string): ArianeeWallet {
        this.account = this.web3.eth.accounts.privateKeyToAccount(privateKey);
        return this.buildAriaWallet();
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
