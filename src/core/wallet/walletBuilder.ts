import { ethers, Wallet as etherWallet } from 'ethers';
import { container } from 'tsyringe';
import { ArianeeConfig } from '../../models/arianeeConfiguration';
import { isPrivateKeyValid } from '../libs/isPrivateKeyValid';
import { ConfigurationService } from './services/configurationService/configurationService';
import { Web3Service } from './services/web3Service/web3Service';
import { ArianeeWallet, ClassicConfiguration } from './wallet';

const Web3 = require('web3');

export class ArianeeWalletBuilder {
  private container;
  private web3=new Web3();

  constructor (private arianeeConfig: ArianeeConfig) {
  }

  private buildAriaWalletFrom (configuration:ClassicConfiguration): ArianeeWallet {
    if (this.web3.utils.isAddress(configuration.account.address)) {
      return new ArianeeWallet(configuration, this.arianeeConfig);
    }
    throw new Error('invalid address');
  }

  public fromPassPhrase (passphrase: string): ArianeeWallet {
    const privateKey = this.web3.utils.padLeft(
      this.web3.utils.toHex(passphrase),
      64
    );

    return this.fromPrivateKey(privateKey);
  }

  /**
   * From a randomKey and return ArianeeProtocol
   */
  public fromRandomKey (): ArianeeWallet {
    const randomWallet = etherWallet.createRandom();
    const mnemonic = randomWallet.mnemonic;
    const account = this.web3.eth.accounts.privateKeyToAccount(
      randomWallet.privateKey
    );

    return this.buildAriaWalletFrom({ account, mnemonic });
  }

  /**
   * Generate a mnemonic and return ArianeeProtocol
   * @param data
   */
  public fromRandomMnemonic (): ArianeeWallet {
    return this.fromRandomKey();
  }

  /**
   *  From a mnemonic and return ArianeeProtocol
   * @param mnemonic
   */
  public fromMnemonic (mnemonic: string): ArianeeWallet {
    const isValidMnemonic = ethers.utils.HDNode.isValidMnemonic(mnemonic);
    if (isValidMnemonic) {
      const { privateKey } = etherWallet.fromMnemonic(mnemonic);
      const account = this.web3.eth.accounts.privateKeyToAccount(privateKey);

      return this.buildAriaWalletFrom({ account, mnemonic });
    } else {
      throw new Error('invalid mnemonic');
    }
  }

  /**
   *  From privatekey and return ArianeeProtocol
   * @param privateKey
   * @param bdHVaultURL
   */
  public fromPrivateKey (privateKey: string): ArianeeWallet {
    if (!isPrivateKeyValid(privateKey)) {
      throw new Error('privateKey should start with 0x and should be 0x+64 characters');
    }
    const account = this.web3.eth.accounts.privateKeyToAccount(privateKey);

    return this.buildAriaWalletFrom({ account });
  }
}
