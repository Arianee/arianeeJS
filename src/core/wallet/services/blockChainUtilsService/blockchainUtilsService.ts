import { injectable } from 'tsyringe';
import { ConfigurationService } from '../configurationService/configurationService';
import { UtilsService } from '../utilService/utilsService';
import { WalletService } from '../walletService/walletService';
import { Web3Service } from '../web3Service/web3Service';

@injectable()
export class BlockchainUtilsService {
  constructor (private web3Service: Web3Service,
                private configurationService: ConfigurationService,
                private utilsService:UtilsService,
                private walletService: WalletService) {

  }

    /**
     * Cancel transaction from nonce to another nonce (both included)
     * @param {{fromNonce: number; toNonce?: number; gas?: number; gasPrice?: number}} parameters
     * @returns {Promise<void>}
     */
    public cancelTransactions = async (parameters: {
        fromNonce: number,
        toNonce?: number,
        gas?: number,
        gasPrice?: number
    }) => {
      let { fromNonce, toNonce, gas, gasPrice } = parameters;
      toNonce = toNonce || fromNonce;
      const results = [];
      gasPrice = gasPrice ||
            this.configurationService.arianeeConfiguration.transactionOptions.gasPrice * 1.5;
      gas = gas ||
            this.configurationService.arianeeConfiguration.transactionOptions.gas;

      const numberOfI = toNonce - fromNonce;
      for (var i = 0; i <= numberOfI; i++) {
        const signedTransaction = await this.walletService.signTransaction({
          value: '0',
          to: this.walletService.address,
          gas: gas,
          gasPrice: gasPrice,
          nonce: fromNonce + i
        });

        const result = await
        this.web3Service.web3.eth
          .sendSignedTransaction(signedTransaction.rawTransaction);

        results.push(result);
      }
    };
}
