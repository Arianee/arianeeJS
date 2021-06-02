import { TxData } from '@ethereumjs/tx';
import { BigNumber, Transaction as EtherTransaction } from 'ethers/utils';
import { provider, TransactionConfig as Web3Transaction } from 'web3-core';

export interface MixedTransaction {
    nonce: string | number,
    gasPrice: string | number,
    to: string,
    value?: string,
    chainId?: number,
    data?: string
    from?: string,
    gasLimit?: string | number,
    gas?: string | number,
}

export class TransactionMapper {
  constructor (private mixedTransaction: MixedTransaction) {

  }

  private get gasLimit () {
    return this.mixedTransaction.gas || this.mixedTransaction.gasLimit;
  }

  private static toBigNumber (value): BigNumber {
    if (value === undefined) {
      return undefined;
    } else if (BigNumber.isBigNumber(value)) {
      return value.toHexString() as any;
    } else {
      return new BigNumber(value).toHexString() as any;
    }
  }

  private clean=(obj) => {
    Object.keys(obj).forEach(key => obj[key] === undefined ? delete obj[key] : {});
    return obj;
  };

  private static toNumber (value: any): number {
    if (BigNumber.isBigNumber(value)) {
      return value.toNumber();
    } else if (typeof value === 'string') {
      return parseInt(value);
    } else {
      return value;
    }
  }

    public toWeb3 = (): Web3Transaction => {
      return this.clean({
        nonce: TransactionMapper.toNumber(this.mixedTransaction.nonce),
        gasPrice: TransactionMapper.toNumber(this.mixedTransaction.gasPrice),
        to: this.mixedTransaction.to,
        value: this.mixedTransaction.value,
        chainId: this.mixedTransaction.chainId,
        data: this.mixedTransaction.data,
        gas: TransactionMapper.toNumber(this.gasLimit)
      });
    }

    public toEtherjs = (): EtherTransaction => {
      return this.clean({
        nonce: TransactionMapper.toNumber(this.mixedTransaction.nonce),
        gasPrice: TransactionMapper.toBigNumber(this.mixedTransaction.gasPrice),
        to: this.mixedTransaction.to,
        value: TransactionMapper.toBigNumber(this.mixedTransaction.value),
        chainId: this.mixedTransaction.chainId,
        data: this.mixedTransaction.data,
        gasLimit: TransactionMapper.toBigNumber(this.gasLimit)
      }) as any;
    };

    public toEthereumjs ():TxData {
      return this.clean({
        nonce: TransactionMapper.toBigNumber(this.mixedTransaction.nonce),
        gasPrice: TransactionMapper.toBigNumber(this.mixedTransaction.gasPrice),
        to: this.mixedTransaction.to,
        value: TransactionMapper.toBigNumber(this.mixedTransaction.value),
        chainId: this.mixedTransaction.chainId,
        data: this.mixedTransaction.data,
        gasLimit: TransactionMapper.toBigNumber(this.gasLimit)
      }) as any;
    }

    public toMetamaskTransaction = () => {
      return this.clean({
        from: this.mixedTransaction.from,
        to: this.mixedTransaction.to,
        gasPrice: '0x' + this.mixedTransaction.gasPrice.toString(16),
        gas: '0x' + this.mixedTransaction.gasLimit.toString(16),
        nonce: '0x' + this.mixedTransaction.nonce.toString(16),
        data: this.mixedTransaction.data
      });
    }
}
