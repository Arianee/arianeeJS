import { singleton } from 'tsyringe';
import { Web3Service } from '../web3Service/web3Service';
import { UtilsService } from '../utilService/utilsService';
import { WalletService } from '../walletService/walletService';

@singleton()
export class BatchService {
  constructor (
    private web3Service: Web3Service,
    private utilsService: UtilsService,
    private walletService: WalletService
  ) {
  }

  private batchTransactions = [];
  private transactionInProgress = [];

  public addToBatch (transaction: any) {
    const contractAddress = transaction._parent._address;
    this.batchTransactions.push([contractAddress, transaction.encodeABI()]);
    return this;
  }

  public async executeBatch () {
    const batch = new this.web3Service.web3.BatchRequest();
    const initialNonce = await this.web3Service.web3.eth.getTransactionCount(
      this.walletService.publicKey,
      'pending'
    );

    this.batchTransactions.forEach(async (value, index) => {
      const transaction = await this.utilsService.signTransaction(value[1], value[0], initialNonce + index);
      this.transactionInProgress.push({
        txHash: transaction.transactionHash,
        txRow: transaction.rawTransaction,
        creationDate: new Date()
      });

      batch.add(this.web3Service.web3.eth.sendSignedTransaction(transaction.rawTransaction));
    });

    this.batchTransactions = [];
    batch.execute();
    return this.watchPendingTransaction();
  }

  public watchPendingTransaction () {
    return new Promise((resolve, reject) => {
      const rejectTransaction = [];
      const delay = 10000 + (this.transactionInProgress.length / 20) * 5000;

      const interval = setInterval(async () => {
        if (this.transactionInProgress.length > 0) {
          this.transactionInProgress.forEach(async (value, index) => {
            const transaction = await this.web3Service.web3.eth.getTransactionReceipt(value.txHash);
            if (transaction) {
              if (transaction.status === true) {
                this.transactionInProgress.splice(index, 1);
              } else if (transaction.status === false) {
                rejectTransaction.push(value);
                this.transactionInProgress.splice(index, 1);
              }
            } else {
              if ((new Date().valueOf() - value.creationDate.valueOf()) > delay) {
                rejectTransaction.push(value);
                this.transactionInProgress.splice(index, 1);
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
