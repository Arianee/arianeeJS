import { injectable } from 'tsyringe';
import { ArianeeTokenId } from '../../../../models/ArianeeTokenId';
import { creditTypeEnum } from '../../../../models/creditTypesEnum';
import { ExtendedBoolean } from '../../../../models/extendedBoolean';
import { BalanceService } from '../balanceService/balanceService';
import { ConfigurationService } from '../configurationService/configurationService';
import { ContractService } from '../contractService/contractsService';
import { WalletService } from '../walletService/walletService';

@injectable()
export class DiagnosisService {
  constructor (private contractService:ContractService,
               private configurationService:ConfigurationService,
               private balanceService:BalanceService,
               private walletService:WalletService) {}

  diagnosis=async (diagnosisList:Array<Promise<ExtendedBoolean>>, rawErrors?:any) => {
    if (diagnosisList === undefined || undefined) {
      diagnosisList = [
        this.isStoreApprove(),
        this.isAriaCredit(),
        this.isPOACredit(),
        this.isEventCredit(),
        this.isCertificateCredit()
      ];
    }
    const diagnosis:Array<ExtendedBoolean> = await Promise.all(diagnosisList);

    const errors = diagnosis.filter(diagnosis => !diagnosis.isTrue);

    if (errors.length === 0) {
      const rawValue = typeof rawErrors === 'string' ? rawErrors : JSON.stringify(rawErrors);
      errors.push({
        isTrue: false,
        rawValue,
        message: 'An unknown error occured. Please try again later',
        code: 'error.unknown'
      });
    };

    return errors;
  }

    public isStoreApprove=async ():Promise<ExtendedBoolean> => {
      const smartAssetContractAddress = this.configurationService.arianeeConfiguration.store.address;
      const isApproved = await this.contractService.ariaContract.methods
        .allowance(this.walletService.address, smartAssetContractAddress)
        .call();

      return {
        isTrue: isApproved.toString() !== '0',
        rawValue: isApproved,
        message: 'You should approveStore on aria smart contract',
        code: 'approve.store'
      };
    }

    public isCertificateCredit=async ():Promise<ExtendedBoolean> => {
      const balance = await this.balanceService.balanceOfCredit('certificate');

      const isTrue = parseInt(balance.toString()) > 0;

      return {
        isTrue,
        rawValue: balance,
        message: 'certificate credit should be higher than 0',
        code: 'credit.certificate'
      };
    }

    public isEventCredit=async ():Promise<ExtendedBoolean> => {
      const balance = await this.balanceService.balanceOfCredit('event');

      const isTrue = parseInt(balance.toString()) > 0;

      return {
        isTrue,
        rawValue: balance,
        message: 'event credit should be higher than 0',
        code: 'credit.event'
      };
    }

    public isMessageCredit=async ():Promise<ExtendedBoolean> => {
      const balance = await this.balanceService.balanceOfCredit('message');

      const isTrue = parseInt(balance.toString()) > 0;

      return {
        isTrue,
        rawValue: balance,
        message: 'message credit should be higher than 0',
        code: 'credit.message'
      };
    }    

    public isAriaCredit=async ():Promise<ExtendedBoolean> => {
      const balance = await this.balanceService.balanceOfAria();

      const isTrue = parseInt(balance.toString()) > 0;

      return {
        isTrue,
        rawValue: balance,
        message: 'Your aria credit credit should be higher than 0',
        code: 'credit.Aria'
      };
    }

    public isPOACredit=async ():Promise<ExtendedBoolean> => {
      const balance = await this.balanceService.balanceOfPoa();

      const isTrue = (+balance.toString()) > 0;

      return {
        isTrue,
        rawValue: balance,
        message: 'You poa credit credit should be higher than 0',
        code: 'credit.POA'
      };
    }

    public isCertificateIdExist=async (tokenId:ArianeeTokenId):Promise<ExtendedBoolean> => {
      var isOwner:boolean;
      try {
        await this.contractService.smartAssetContract.methods.ownerOf(tokenId).call();
        isOwner = false;
      } catch (e) {
        isOwner = true;
      }

      return {
        isTrue: isOwner,
        rawValue: isOwner,
        message: 'This certificate id already exist',
        code: 'certificate.id'
      };
    }
}
