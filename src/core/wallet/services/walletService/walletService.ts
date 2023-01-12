import Common from '@ethereumjs/common';
import { Transaction as Tx } from '@ethereumjs/tx';
import { injectable } from 'tsyringe';
import { Transaction } from 'web3-core';
import { MixedTransaction, TransactionMapper } from '../../../etherjsWeb3Transaction/TransactionMapper';
import { ConfigurationService } from '../configurationService/configurationService';
import { Web3Service } from '../web3Service/web3Service';
import { TransactionObject } from '@arianee/arianee-abi/types/types';
import { TransactionReadableService } from '../transactionReadableService/transactionReadableService';

@injectable()
export class WalletService {
    public userCustomSign: (data: string) => Promise<{ message: string, messageHash: string, signature: string }>;

    public account;
    public metamask;
    public userCustomSendTransaction: (transaction: Transaction, data?: any) => Promise<any>;
    public userCustomCall: (transaction: Transaction, data: TransactionObject<any>) => Promise<any>;

    constructor (private web3Service: Web3Service,
                private configurationService: ConfigurationService,
                 private transactionReadableService:TransactionReadableService
    ) {
    }

    public get customSendTransaction () {
      return async (transaction, data) => {
        const { constant, inputs, name, outputs, payable, stateMutability, type, signature } = data._method;

        const readableTransaction = await this.transactionReadableService.getReadableTransaction({ data, transaction });

        const result = await this.userCustomSendTransaction(transaction, readableTransaction);
        return {
          message: 'message sent through custom send transaction method',
          ...result,
          ...transaction,
          readableTransaction
        };
      };
    }

    public isRemoteAccount = () => {
      return this.privateKey === undefined && this.address && this.userCustomSign === undefined && !this.metamask;
    }

    private customCommon = Common.forCustomChain(
      'mainnet',
      {
        networkId: this.configurationService.arianeeConfiguration.chainId,
        name: this.configurationService.arianeeConfiguration.networkName,
        chainId: this.configurationService.arianeeConfiguration.chainId
      },
      'istanbul'
    );

    public signTransaction = async (transaction: MixedTransaction): Promise<{ rawTransaction: string, transactionHash: string }> => {
      const transactionMapped = new TransactionMapper(transaction).toEthereumjs();

      const tx = Tx.fromTxData(transactionMapped, { common: this.customCommon })
        .serialize().toString('hex');

      const { signature, messageHash } = await this.sign(tx);

      return { rawTransaction: signature, transactionHash: messageHash };
    };

    public signProof = async (data: string, privateKey = this.privateKey): Promise<{ message: string, messageHash: string, signature: string }> => {
      return this.sign(data, privateKey);
    }

    public sign = async (data: string, privateKey = this.privateKey): Promise<{ message: string, messageHash: string, signature: string }> => {
      let signature;
      let messageHash;
      let message = data;

      if (privateKey) {
        let decodedTx;
        try {
          decodedTx = Tx.fromSerializedTx(Buffer.from(data, 'hex'), { common: this.customCommon });
        } catch (e) {
        }
        let signObject;
        if (decodedTx) {
          message = JSON.stringify(decodedTx.toJSON());
          signature = '0x' + decodedTx.sign(Buffer.from(privateKey.substring(2), 'hex')).serialize().toString('hex');

          messageHash = this.web3Service.web3.utils.keccak256(signature);
        } else {
          signObject = this.web3Service.web3.eth.accounts.sign(<string>data, privateKey);
          signature = signObject.signature;
          messageHash = signObject.messageHash;
        }
      } else if (this.isRemoteAccount()) {
        signature = await this.web3Service.web3.eth.personal.sign(<string>data, this.address);
        messageHash = this.web3Service.web3.eth.accounts.hashMessage(data);
      } else if (this.userCustomSign) {
        return this.userCustomSign(data);
      } else if (this.metamask) {
        signature = await window.ethereum.request({
          method: 'personal_sign',
          params: [data, this.address]
        });
        messageHash = this.web3Service.web3.eth.accounts.hashMessage(data);
      } else {
        throw new Error('There is no signing account');
      }

      return { message, signature, messageHash };
    }

    public get address (): string {
      return this.account.address;
    }

    public get privateKey (): string {
      return this.account.privateKey;
    }

    public isCustomSendTransaction = (): boolean => {
      return this.userCustomSendTransaction !== undefined;
    }

    public isCustomCall = (): boolean => {
      return this.userCustomCall !== undefined;
    }
}
