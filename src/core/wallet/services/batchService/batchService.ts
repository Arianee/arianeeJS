import { injectable, singleton } from 'tsyringe';
import { Web3Service } from '../web3Service/web3Service';
import { UtilsService } from '../utilService/utilsService';
import { WalletService } from '../walletService/walletService';

@injectable()
export class BatchService {
  constructor (
    private web3Service: Web3Service,
    private utilsService: UtilsService,
    private walletService: WalletService
  ) {
  }

  private batchTransactions = [];

  public addToBatch (transaction: any) {
    const contractAddress = transaction._parent._address;
    this.batchTransactions.push([contractAddress, transaction.encodeABI()]);
    return this;
  }

  public async executeBatch () {
    const initialNonce = await this.web3Service.web3.eth.getTransactionCount(
      this.walletService.address,
      'pending'
    );

    const transactionsPromise = this.batchTransactions.map(async (value, index) => {
      const prepareTransaction = await this.utilsService.prepareTransaction(value[1], value[0], initialNonce + index);
      const transaction = await this.walletService.signTransaction(prepareTransaction);
      this.web3Service.web3.eth.sendSignedTransaction(transaction.rawTransaction);
      return {
        txHash: transaction.transactionHash,
        txRow: transaction.rawTransaction,
        creationDate: new Date()
      };
    });

    const transactions = await Promise.all(transactionsPromise);
    this.batchTransactions = [];
    return this.watchPendingTransaction(transactions);
  }

  public watchPendingTransaction (transactionInProgress) {
    return new Promise((resolve, reject) => {
      const rejectTransaction = [];
      const delay = 10000 + (transactionInProgress.length / 20) * 5000;

      const interval = setInterval(async () => {
        if (transactionInProgress.length > 0) {
          transactionInProgress.forEach(async (value, index) => {
            const transaction = await this.web3Service.web3.eth.getTransactionReceipt(value.txHash);
            if (transaction) {
              if (transaction.status === true) {
                transactionInProgress.splice(index, 1);
              } else if (transaction.status === false) {
                rejectTransaction.push(value);
                transactionInProgress.splice(index, 1);
              }
            } else {
              if ((new Date().valueOf() - value.creationDate.valueOf()) > delay) {
                rejectTransaction.push(value);
                transactionInProgress.splice(index, 1);
              }
            }
          });
        } else {
          clearInterval(interval);
          if (rejectTransaction.length === 0) {
            resolve('Everything is awesome');
          } else {
            reject(rejectTransaction);
          }
        }
      }, 1000);
    });
  }
}
