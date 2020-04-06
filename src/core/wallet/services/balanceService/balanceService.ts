import { injectable } from 'tsyringe';
import { creditTypeEnum } from '../../../../models/creditTypesEnum';
import { ArianeeHttpClient } from '../../../libs/arianeeHttpClient/arianeeHttpClient';
import { ConfigurationService } from '../configurationService/configurationService';
import { ContractService } from '../contractService/contractsService';
import { WalletService } from '../walletService/walletService';
import { Web3Service } from '../web3Service/web3Service';

@injectable()
export class BalanceService {
  constructor (private contractService:ContractService,
               private walletService:WalletService,
               private web3Service:Web3Service) {}

  public balanceOfAria = async (address = this.walletService.account.address): Promise<string> => {
    const balance = await this.contractService.ariaContract.methods
      .balanceOf(address)
      .call();

    return balance.toString();
  }

  public balanceOfPoa = async (address = this.walletService.account.address): Promise<string> => {
    const balance = await this.web3Service.web3.eth
      .getBalance(address);

    return balance;
  }

  public balanceOfCredit = async (creditType:string, address = this.walletService.account.address): Promise<string> => {
    if (!Object.prototype.hasOwnProperty.call(creditTypeEnum, creditType)) {
      throw new Error('this credit type does not exist !!! ' + creditType);
    }
    const balance = await this.contractService.creditHistoryContract.methods.balanceOf(address, creditTypeEnum[creditType]).call();
    return balance.toString();
  }
}
