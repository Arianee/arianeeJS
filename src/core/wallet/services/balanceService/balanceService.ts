import { injectable } from 'tsyringe';
import { creditNameToType, creditTypeEnum } from '../../../../models/creditTypesEnum';
import { ContractService } from '../contractService/contractsService';
import { WalletService } from '../walletService/walletService';
import { Web3Service } from '../web3Service/web3Service';

@injectable()
export class BalanceService {
  constructor (private contractService:ContractService,
               private walletService:WalletService,
               private web3Service:Web3Service) {}

  /**
   * Get balance of Aria (with 18 decimals)
   * @param {any} address
   * @returns {Promise<string>}
   */
  public balanceOfAria = async (address = this.walletService.account.address): Promise<string> => {
    return this.balanceOfRia(address);
  };

  /**
   * Get balance of Aria (without the 18 decimals) readable by human
   * @param {any} address
   * @returns {Promise<string>}
   */
  public balanceOfAriaReadable = async (address = this.walletService.account.address): Promise<string> => {
    const balance = await this.contractService.ariaContract.methods
      .balanceOf(address)
      .call();

    const amount = new this.web3Service.web3.utils.BN(balance);

    const dividedBy = new this.web3Service.web3.utils.BN(10)
      .pow(new this.web3Service.web3.utils.BN(18));

    return amount.div(dividedBy).toString();
  };

  /**
   * Get balance of Ria (aria * 10^18)
   * @param {any} address
   * @returns {Promise<string>}
   */
  public balanceOfRia = async (address = this.walletService.account.address): Promise<string> => {
    const balance = await this.contractService.ariaContract.methods
      .balanceOf(address)
      .call();

    return balance.toString();
  };

  public balanceOfPoa = async (address = this.walletService.account.address): Promise<string> => {
    const balance = await this.web3Service.web3.eth
      .getBalance(address);

    return balance;
  }

  /**
   * Get credit price in ria (aria * 10^18)
   * @param {creditTypeEnum | string} creditType
   * @returns {Promise<any>}
   */
  public getCreditPrice = async (creditType: creditTypeEnum | string): Promise<any> => {
    if (!Object.prototype.hasOwnProperty.call(creditTypeEnum, creditType)) {
      throw new Error('this credit type does not exist !!! ' + creditType);
    }

    return this.contractService.storeContract.methods.getCreditPrice(creditNameToType[creditType]).call();
  };

  public balanceOfCredit = async (creditType: creditTypeEnum | string, address = this.walletService.account.address): Promise<string> => {
    if (!Object.prototype.hasOwnProperty.call(creditTypeEnum, creditType)) {
      throw new Error('this credit type does not exist !!! ' + creditType);
    }

    const balance = await this.contractService
      .creditHistoryContract
      .methods
      .balanceOf(address, creditNameToType[creditType]).call();
    return balance.toString();
  }
}
