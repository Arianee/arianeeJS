import {
  Aria,
  ArianeeCreditHistory,
  ArianeeEvent,
  ArianeeIdentity,
  ArianeeSmartAsset,
  ArianeeStaking,
  ArianeeStore,
  ArianeeWhitelist,
  ArianeeMessage
} from '@arianee/arianee-abi';
import { ArianeeLost } from '@arianee/arianee-abi/types/ArianeeLost';
import { container, injectable } from 'tsyringe';
import { Contract } from 'web3-eth-contract';
import { ArianeeContract } from '../../../libs/arianeeContract';
import { ConfigurationService } from '../configurationService/configurationService';
import { POAAndAriaService } from '../POAAndAriaFaucet/POAAndAriaService';
import { UtilsService } from '../utilService/utilsService';
import { WalletService } from '../walletService/walletService';
import { Web3Service } from '../web3Service/web3Service';
import { get } from 'lodash';

@injectable()
export class ContractService {
  public smartAssetContract: ArianeeSmartAsset;
  public storeContract: ArianeeStore;
  public identityContract: ArianeeIdentity;
  public ariaContract: Aria;
  public creditHistoryContract: ArianeeCreditHistory;
  public whitelistContract: ArianeeWhitelist;
  public stakingContract: ArianeeStaking;
  public eventContract: ArianeeEvent;
  public lostContract: ArianeeLost;
  public messageContract: ArianeeMessage;


  constructor (private walletService: WalletService,
              private web3Service: Web3Service,
              private poaAndAriaService:POAAndAriaService,
              private configurationService: ConfigurationService,
               private utilsService:UtilsService
  ) {
    this.smartAssetContract = this.create<ArianeeSmartAsset>('smartAsset');
    this.identityContract = this.create<ArianeeIdentity>('identity');
    this.ariaContract = this.create<Aria>('aria');

    this.storeContract = this.create<ArianeeStore>('store');
    this.creditHistoryContract = this.create<ArianeeCreditHistory>('creditHistory');
    this.whitelistContract = this.create<ArianeeWhitelist>('whitelist');
    this.stakingContract = this.create<ArianeeStaking>('staking');

    const isEventArianee =
        get(this.configurationService, 'arianeeConfiguration.eventArianee.abi') &&
    get(this.configurationService, 'arianeeConfiguration.eventArianee.address');

    if (isEventArianee) {
      this.eventContract = this.create<ArianeeEvent>('eventArianee');
    }

    const islostArianee =
        get(this.configurationService, 'arianeeConfiguration.lost.abi') &&
        get(this.configurationService, 'arianeeConfiguration.lost.address');

    if (islostArianee) {
      this.lostContract = this.create<ArianeeLost>('lost');
    }

    const isMessageArianee =
        get(this.configurationService, 'arianeeConfiguration.message.abi') &&
        get(this.configurationService, 'arianeeConfiguration.message.address');

    if (isMessageArianee) {
      this.messageContract = this.create<ArianeeMessage>('message');
    }    
  }

  create<T extends Contract> (name: string): T {
    try {
      const contract = new this.web3Service.web3.eth.Contract(
        this.configurationService.arianeeConfiguration[name].abi,
        this.configurationService.arianeeConfiguration[name].address
      );

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
