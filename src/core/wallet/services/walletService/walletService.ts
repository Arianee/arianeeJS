import { injectable } from 'tsyringe';
import { Transaction } from 'web3-core';

@injectable()
export class WalletService {
  public account;
  public userCustomSendTransaction: (transaction:Transaction) => Promise<any>;

  public get customSendTransaction () {
    return async (transaction) => {
      const result = await this.userCustomSendTransaction(transaction);
      return {
        message: 'message sent through custom send transaction method',
        ...result,
        ...transaction
      };
    };
  }

  public get address (): string {
    return this.account.address;
  }

  public get privateKey (): string {
    return this.account.privateKey;
  }

  public isCustomSendTransaction ():boolean {
    return this.userCustomSendTransaction !== undefined;
  }
}
