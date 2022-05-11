import {
  Aria,
  ArianeeCreditHistory,
  ArianeeEvent,
  ArianeeIdentity,
  ArianeeMessage,
  ArianeeSmartAsset,
  ArianeeStaking,
  ArianeeStore,
  ArianeeUpdate,
  ArianeeUserAction,
  ArianeeWhitelist
} from '@arianee/arianee-abi';
import { ArianeeLost } from '@arianee/arianee-abi/types/ArianeeLost';
import { injectable } from 'tsyringe';
import { Contract } from 'web3-eth-contract';
import { ArianeeContract } from '../../../libs/arianeeContract';
import { ConfigurationService } from '../configurationService/configurationService';
import { POAAndAriaService } from '../POAAndAriaFaucet/POAAndAriaService';
import { UtilsService } from '../utilService/utilsService';
import { WalletService } from '../walletService/walletService';
import { Web3Service } from '../web3Service/web3Service';
import { get } from 'lodash';

export enum ContractName {
  smartAssetContract = 'smartAssetContract',
  storeContract = 'storeContract',
  identityContract = 'identityContract',
  ariaContract='ariaContract',
  creditHistoryContract='creditHistoryContract',
  whitelistContract='whitelistContract',
  stakingContract='stakingContract',
  eventContract='eventContract',
  messageContract='messageContract',
  userActionContract='userActionContract',
  updateSmartAssetContract='updateSmartAssetContract',
  lostContract='lostContract',
}
@injectable()
export class ContractService {
  public [ContractName.smartAssetContract]: ArianeeSmartAsset;
  public [ContractName.storeContract]: ArianeeStore;
  public [ContractName.identityContract]: ArianeeIdentity;
  public [ContractName.ariaContract]: Aria;
  public [ContractName.creditHistoryContract]: ArianeeCreditHistory;
  public [ContractName.whitelistContract]: ArianeeWhitelist;
  public [ContractName.stakingContract]: ArianeeStaking;
  public [ContractName.eventContract]: ArianeeEvent;
  public [ContractName.lostContract]: ArianeeLost;
  public [ContractName.messageContract]: ArianeeMessage;
  public [ContractName.userActionContract]: ArianeeUserAction;
  public [ContractName.updateSmartAssetContract]: ArianeeUpdate;

  constructor (private walletService: WalletService,
              private web3Service: Web3Service,
              private poaAndAriaService:POAAndAriaService,
              private configurationService: ConfigurationService,
               private utilsService:UtilsService
  ) {
    this.smartAssetContract = this.create<ArianeeSmartAsset>('smartAsset', ContractName.smartAssetContract);
    this.identityContract = this.create<ArianeeIdentity>('identity', ContractName.identityContract);
    this.ariaContract = this.create<Aria>('aria', ContractName.ariaContract);

    this.storeContract = this.create<ArianeeStore>('store', ContractName.storeContract);
    this.creditHistoryContract = this.create<ArianeeCreditHistory>('creditHistory', ContractName.creditHistoryContract);
    this.whitelistContract = this.create<ArianeeWhitelist>('whitelist', ContractName.whitelistContract);
    this.stakingContract = this.create<ArianeeStaking>('staking', ContractName.stakingContract);

    const isEventArianee =
        get(this.configurationService, 'arianeeConfiguration.eventArianee.abi') &&
    get(this.configurationService, 'arianeeConfiguration.eventArianee.address');

    if (isEventArianee) {
      this.eventContract = this.create<ArianeeEvent>('eventArianee', ContractName.eventContract);
    }

    const islostArianee =
        get(this.configurationService, 'arianeeConfiguration.lost.abi') &&
        get(this.configurationService, 'arianeeConfiguration.lost.address');

    if (islostArianee) {
      this.lostContract = this.create<ArianeeLost>('lost', ContractName.lostContract);
    }

    const isMessageArianee =
        get(this.configurationService, 'arianeeConfiguration.message.abi') &&
        get(this.configurationService, 'arianeeConfiguration.message.address');

    if (isMessageArianee) {
      this.messageContract = this.create<ArianeeMessage>('message', ContractName.messageContract);
    }

    const isUserAction =
        get(this.configurationService, 'arianeeConfiguration.userAction.abi') &&
        get(this.configurationService, 'arianeeConfiguration.userAction.address');

    if (isUserAction) {
      this.userActionContract = this.create<ArianeeUserAction>('userAction', ContractName.userActionContract);
    }

    const isupdateSmartAssetContract =
      get(this.configurationService, 'arianeeConfiguration.updateSmartAssets.abi') &&
      get(this.configurationService, 'arianeeConfiguration.updateSmartAssets.address');

    if (isupdateSmartAssetContract) {
      this.updateSmartAssetContract = this.create<ArianeeUpdate>('updateSmartAssets', ContractName.updateSmartAssetContract);
    }
  }

  /**
   * Get web3 contract instance from address
   * @param addressOrContractName
   */
  public getContractInstanceFromAddressOrContractName=(addressOrContractName:string | ContractName):Contract => {
    const contractName = this.reverseMapper[addressOrContractName];
    return this[contractName] || this[addressOrContractName];
  }

  // map address to smart contract name
  public reverseMapper:{[key:string]:ContractName}={};

  create<T extends Contract> (name: string, arianeeJSContractName:ContractName): T {
    try {
      const contract = new this.web3Service.web3.eth.Contract(
        this.configurationService.arianeeConfiguration[name].abi,
        this.configurationService.arianeeConfiguration[name].address
      );

      this.reverseMapper[this.configurationService.arianeeConfiguration[name].address] = arianeeJSContractName;

      return new ArianeeContract<T>(
        contract,
        this.walletService,
        this.web3Service,
        this.poaAndAriaService,
        this.utilsService
      ).makeArianee();
    } catch (e) {
      console.error(`this contract does not have configuration ${name}`);
    }
  }
}
