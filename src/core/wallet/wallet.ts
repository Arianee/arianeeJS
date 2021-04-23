import { container } from 'tsyringe';
import { Transaction } from 'web3-core';
import { ArianeeConfig } from '../../models/arianeeConfiguration';
import { ArianeeHttpClient } from '../libs/arianeeHttpClient/arianeeHttpClient';
import { SimpleStore } from '../libs/simpleStore/simpleStore';
import { ConsolidatedCertificateRequest } from './certificateSummary/certificateSummary';
import { ArianeeEventEmitter } from './services/arianeeEventEmitterService/ArianeeEventEmitter';
import { BalanceService } from './services/balanceService/balanceService';
import { BatchService } from './services/batchService/batchService';
import { BlockchainEventWatcherService } from './services/blockchainEventWatcherService/blochainEventWatcherService';
import { CertificateAuthorizationService } from './services/certificateAuthorizationService/certificateAuthorizationService';
import { CertificateDetails } from './services/certificateDetailsService/certificatesDetailsService';
import { CertificateService } from './services/certificateService/certificateService';
import { CertificateUtilsService } from './services/certificateUtilsService/certificateUtilsService';
import { ConfigurationService } from './services/configurationService/configurationService';
import { ContractService } from './services/contractService/contractsService';
import { DiagnosisService } from './services/diagnosisService/diagnosisService';
import { EventService } from './services/eventService/eventsService';
import { GlobalConfigurationService } from './services/globalConfigurationService/globalConfigurationService';
import { IdentityService } from './services/identityService/identityService';
import { JWTService } from './services/ArianeeAccessToken/JWTService';
import { MessageService } from './services/messageService/messageService';
import { POAAndAriaService } from './services/POAAndAriaFaucet/POAAndAriaService';
import { UtilsService } from './services/utilService/utilsService';
import { WalletCustomMethodService } from './services/walletCustomMethodService/walletCustomMethodService';
import { WalletService } from './services/walletService/walletService';
import { Web3Service } from './services/web3Service/web3Service';
import EventEmitter = require('eventemitter3');

export interface ClassicConfiguration{
    account:any,
    mnemonic?:string,
    web3?:any
}

export class ArianeeWallet {
    private container;
    private _account;
    private _mnemonic;

    public constructor (configuration: ClassicConfiguration, arianeeConfig: ArianeeConfig) {
      this.container = container.createChildContainer();

      this.registerSingletons(
        ArianeeEventEmitter,
        BatchService,
        BalanceService,
        BlockchainEventWatcherService,
        CertificateAuthorizationService,
        CertificateDetails,
        CertificateService,
        ConfigurationService,
        ContractService,
        DiagnosisService,
        EventService,
        IdentityService,
        MessageService,
        GlobalConfigurationService,
        POAAndAriaService,
        SimpleStore,
        UtilsService,
        WalletService,
        Web3Service,
        JWTService,
        CertificateUtilsService
      );

      if (configuration.web3) {
        this.container.resolve(Web3Service).web3 = configuration.web3;
      }

      this.container.register(ArianeeHttpClient,
        { useValue: arianeeConfig.arianeeHttpClient });

      this.container.resolve(ConfigurationService).arianeeConfiguration = arianeeConfig;

      const walletService: WalletService = this.container.resolve(WalletService);

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

    public get globalConfiguration () {
      return this.container.resolve(GlobalConfigurationService);
    }

    public setCustomSendTransaction (send:(transaction:Transaction)=>Promise<any>):ArianeeWallet {
      const walletService:WalletService = this.container.resolve(WalletService);
      walletService.userCustomSendTransaction = send;

      return this;
    }

    public setCustomSign (sign: (data: string) => Promise<{ message: string, messageHash: string, signature: string }>): ArianeeWallet {
      const walletService: WalletService = this.container.resolve(WalletService);
      walletService.userCustomSign = sign;
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

    public get arianeeMethods () {
      const walletCustomMethods: WalletCustomMethodService = this.container.resolve(WalletCustomMethodService);

      return walletCustomMethods.arianeeMethods();
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

    public get walletservice ():WalletService {
      return this.container.resolve(WalletService);
    }

    public get contracts (): ContractService {
      return this.container.resolve(ContractService);
    }

    public get watch (): EventEmitter {
      return this.container.resolve(ArianeeEventEmitter).EE;
    }

    public setDefaultQuery (value: ConsolidatedCertificateRequest) {
      this.container.resolve(GlobalConfigurationService).setDefaultQuery(value);
      return this;
    }
}
