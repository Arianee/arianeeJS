import {
    Aria,
    ArianeeCreditHistory,
    ArianeeEvent,
    ArianeeIdentity,
    ArianeeSmartAsset,
    ArianeeStaking,
    ArianeeStore,
    ArianeeWhitelist
} from "@arianee/arianee-abi";
import {container} from "tsyringe";
import {ArianeeConfig} from "../../models/arianeeConfiguration";
import {ConfigurationService} from "./services/configurationService/configurationService";
import {ContractService} from "./services/contractService/contractsService";
import {WalletCustomMethodService} from "./services/walletCustomMethodService/walletCustomMethodService";
import {WalletService} from "./services/walletService/walletService";
import {Web3Service} from "./services/web3Service/web3Service";

export class ArianeeWallet {
    public storeContract: ArianeeStore;
    public smartAssetContract: ArianeeSmartAsset;
    public identityContract: ArianeeIdentity;
    public ariaContract: Aria;
    public creditHistoryContract: ArianeeCreditHistory;
    public whitelistContract: ArianeeWhitelist;
    public stakingContract: ArianeeStaking;
    public eventContract: ArianeeEvent;

    public brandDataHubRewardAddress =
        "0xA79B29AD7e0196C95B87f4663ded82Fbf2E3ADD8";

    public walletRewardAddress = "0x39da7e30d2D5F2168AE3B8599066ab122680e1ef";

    private container;

    constructor(
        private _account,
        private _mnemonic?
    ) {
        this.container = container.createChildContainer();
        this.container.registerSingleton(WalletService);
        this.container.registerSingleton(Web3Service);

        const walletService = this.container.resolve(WalletService);
        walletService.account = this.account;
    }

    public get publicKey(): string {
        return this.account.address;
    }

    public get privateKey(): string {
        return this.account.privateKey;
    }

    public get mnemnonic(): string {
        return this._mnemonic;
    }

    public get web3() {
        return this.container.resolve(Web3Service).web3;
    }

    public get configuration(): ArianeeConfig {
        const configurationService: ConfigurationService = this.container.resolve(ConfigurationService);

        return configurationService.arianeeConfiguration;
    }

    public get methods() {
        const walletCustomMethods: WalletCustomMethodService = this.container.resolve(WalletCustomMethodService);

        return walletCustomMethods.getMethods();
    }

    public get requestPoa() {
        return this.container.resolve(WalletCustomMethodService).requestPoa;
    }

    public get requestAria() {
        return this.container.resolve(WalletCustomMethodService).requestAria;
    }

    public get account() {
        return this._account;
    }

    public get contracts(): ContractService {
        return this.container.resolve(ContractService);
    }

}
