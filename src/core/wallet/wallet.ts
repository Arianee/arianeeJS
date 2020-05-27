import { Transaction } from 'web3-core';
import { container } from 'tsyringe';
import { ArianeeConfig } from '../../models/arianeeConfiguration';
import { SimpleStore } from '../libs/simpleStore/simpleStore';
import { ArianeeEventEmitter } from './services/arianeeEventEmitterService/ArianeeEventEmitter';
import { BlockchainEventWatcherService } from './services/blockchainEventWatcherService/blochainEventWatcherService';
import { CertificateAuthorizationService } from './services/certificateAuthorizationService/certificateAuthorizationService';
import { ConfigurationService } from './services/configurationService/configurationService';
import { ContractService } from './services/contractService/contractsService';
import { DiagnosisService } from './services/diagnosisService/diagnosisService';
import { GlobalConfigurationService } from './services/globalConfigurationService/globalConfigurationService';
import { POAAndAriaService } from './services/POAAndAriaFaucet/POAAndAriaService';
import { UtilsService } from './services/utilService/utilsService';
import { WalletCustomMethodService } from './services/walletCustomMethodService/walletCustomMethodService';
import { WalletService } from './services/walletService/walletService';
import { Web3Service } from './services/web3Service/web3Service';
import { BatchService } from './services/batchService/batchService';
import EventEmitter = require('eventemitter3');

export interface ClassicConfiguration{
    account:any,
    mnemonic?:string
}

export class ArianeeWallet {
    private container;
    private _account;
    private _mnemonic;

    public constructor (configuration:ClassicConfiguration) {
      this.container = container.createChildContainer();

      this.registerSingletons(
        ContractService,
        WalletService,
        Web3Service,
        POAAndAriaService,
        WalletService,
        ArianeeEventEmitter,
        BlockchainEventWatcherService,
        CertificateAuthorizationService,
        UtilsService,
        BatchService,
        DiagnosisService,
        SimpleStore
      );

      const walletService:WalletService = this.container.resolve(WalletService);
      const configService:ConfigurationService = this.container.resolve(ConfigurationService);

      walletService.account = configuration.account;
      this._account = configuration.account;
      this._mnemonic = configuration.mnemonic;

      this.container.resolve(BlockchainEventWatcherService);
    }

    private registerSingletons (...classNames) {
      classNames.forEach(className => {
        this.container.registerSingleton(className);
      });
    }

    /**
     * Set BDH vault URL
     * @param url
     */
    public useBDHVault (url:string):ArianeeWallet {
      const walletService:WalletService = this.container.resolve(WalletService);
      walletService.bdhVaultURL = url;
      return this;
    }

    public setCustomSendTransaction (send:(transaction:Transaction)=>Promise<any>):ArianeeWallet {
      const walletService:WalletService = this.container.resolve(WalletService);
      walletService.userCustomSendTransaction = send;

      return this;
    }

    /**
     * @deprecated use address instead
     */
    public get publicKey (): string {
      console.warn('publicKey is deprecated use address instead. It will be removed in a next version');
      return this.account.address;
    }

    public get address (): string {
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
      return this.methods.requestPoa;
    }

    public get requestAria () {
      return this.methods.requestAria;
    }

    public get account () {
      return this._account;
    }

    public get contracts (): ContractService {
      return this.container.resolve(ContractService);
    }

    public get watch (): EventEmitter {
      return this.container.resolve(ArianeeEventEmitter).EE;
    }

    public get globalConfiguration () {
      return container.resolve(GlobalConfigurationService);
    }
}
