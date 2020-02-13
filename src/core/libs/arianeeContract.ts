import {TransactionObject} from '@arianee/arianee-abi/types/types';
import {injectable} from 'tsyringe';
import {Transaction} from 'web3-core';
import {Contract} from 'web3-eth-contract';
import {POAAndAriaService} from '../wallet/services/POAAndAriaFaucet/POAAndAriaService';
import {UtilsService} from '../wallet/services/utilService/utilsService';
import {WalletService} from '../wallet/services/walletService/walletService';
import {Web3Service} from '../wallet/services/web3Service/web3Service';
import {flatPromise} from './flat-promise';

@injectable()
export class ArianeeContract<ContractImplementation extends Contract> {
  public key: ContractImplementation;

  public constructor (
    private contract: Contract,
    private walletService: WalletService,
    private web3Service: Web3Service,
    private poaAndAriaService: POAAndAriaService,
    private utilsService:UtilsService
  ) {
    if (contract === undefined) {
      throw new Error('contract is undefined');
    }

    this.key = <ContractImplementation>contract;
    Object.keys(this.key.methods).forEach(method => {
      const b = contract.methods[method];
      if (!method.startsWith('0')) {
        this.key.methods[method] = (...args) => {
          return {
            ...b.bind(b)(...args),
            send: (transaction: Transaction) =>
              this.overideSend(transaction, b.bind(b)(...args)),
            call: (transaction: Transaction) =>
              this.overideCall(transaction, b.bind(b)(...args))
          };
        };
      }
    });
  }

  public makeArianee (): ContractImplementation {
    return this.key;
  }

  /**
   * arianeeSignMetamask
   * @param nonce
   * @param contractAddress
   * @param data
   */
  public arianeeSignMetamask (transaction): Promise<any> {
    const { resolve, promise, reject } = flatPromise();

    this.web3Service.web3.eth.sendTransaction(transaction, function (
      err,
      result
    ) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });

    return promise;
  }

  private overideCall = async (
    transaction: Transaction,
    data: TransactionObject<any>
  ) => {
    const defaultTransaction = {
      from: this.walletService.publicKey
    };
    const mergedTransaction = { ...defaultTransaction, ...transaction };

    return data.call(mergedTransaction);
  };

  private overideSend = async (
    transaction: Transaction,
    data: TransactionObject<any>
  ): Promise<any> => {
    const encodeABI = data.encodeABI();

    const signTransaction = await this.utilsService.signTransaction(encodeABI, this.contract.options.address, false, transaction);

    const [result] = await Promise.all([
      signTransaction,
      this.poaAndAriaService.requestPoa().catch()
    ]);

    return new Promise((resolve, reject) => {
      this.web3Service.web3.eth
        .sendSignedTransaction(result.rawTransaction)
        .on('confirmation', (confirmationNumber, receipt) => {
          resolve({
            result,
            confirmationNumber,
            receipt
          });
        });
    });
  };
}
