import { container } from 'tsyringe';
import { ArianeeConfig } from '../../models/arianeeConfiguration';
import { ConfigurationService } from './services/configurationService/configurationService';
import { ContractService } from './services/contractService/contractsService';
import { POAAndAriaService } from './services/POAAndAriaFaucet/POAAndAriaService';
import { UtilsService } from './services/utilService/utilsService';
import { WalletCustomMethodService } from './services/walletCustomMethodService/walletCustomMethodService';
import { WalletService } from './services/walletService/walletService';
import { Web3Service } from './services/web3Service/web3Service';

export class ArianeeWallet {
    private container;

    constructor (
        private _account,
        private _mnemonic?
    ) {
      this.container = container.createChildContainer();
      this.registerSingletons(WalletService, Web3Service, POAAndAriaService);

      const walletService = this.container.resolve(WalletService);
      walletService.account = this.account;
    }

    private registerSingletons (...classNames) {
      classNames.forEach(className => {
        this.container.registerSingleton(className);
      });
    }

    public get publicKey (): string {
      return this.account.address;
    }

    public get privateKey (): string {
      return this.account.privateKey;
    }

    public get mnemnonic (): string {
      return this._mnemonic;
    }

    public get web3 () {
      return this.container.resolve(Web3Service).web3;
    }

    public get configuration (): ArianeeConfig {
      const configurationService: ConfigurationService = this.container.resolve(ConfigurationService);

      return configurationService.arianeeConfiguration;
    }

    public get methods () {
      const walletCustomMethods: WalletCustomMethodService = this.container.resolve(WalletCustomMethodService);

      return walletCustomMethods.getMethods();
    }

    public get utils () {
      const utilsService: UtilsService = this.container.resolve(UtilsService);

      return utilsService;
    }

    public get requestPoa () {
      return this.container.resolve(WalletCustomMethodService).requestPoa;
    }

    public get requestAria () {
      return this.container.resolve(WalletCustomMethodService).requestAria;
    }

    public get account () {
      return this._account;
    }

    public get contracts (): ContractService {
      return this.container.resolve(ContractService);
    }
}
