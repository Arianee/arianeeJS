import {ethers, Wallet as etherWallet} from "ethers";
import {ArianeeConfig} from "../../models/arianeeConfiguration";
import {ServicesHubBuilder} from "../servicesHub";
import {ArianeeWallet} from "./wallet";

const Web3 = require("web3");

export class ArianeeWalletBuilder {
  private web3 = Web3;

  readonly stateBuilder: ServicesHubBuilder = new ServicesHubBuilder();

  constructor(private arianeeConfig: ArianeeConfig) {
    this.stateBuilder.setConfig(arianeeConfig);
    this.web3 = this.stateBuilder.web3;
  }

  private buildAriaWallet(account, mnemonic?): ArianeeWallet {
    if (this.web3.utils.isAddress(account.address)) {

      const arianeeState = this.stateBuilder.build();

      return new ArianeeWallet(arianeeState, account, mnemonic);
    }
    throw new Error("invalid address");
  }

  public fromPassPhrase(passphrase: string): ArianeeWallet {
    let privateKey = this.web3.utils.padLeft(
      this.web3.utils.toHex(passphrase),
      64
    );

    return this.fromPrivateKey(privateKey);
  }

  /**
   * From a randomKey and return ArianeeProtocol
   */
  public fromRandomKey(): ArianeeWallet {
    const randomWallet = etherWallet.createRandom();
    const mnemonic = randomWallet.mnemonic;
    const account = this.web3.eth.accounts.privateKeyToAccount(
      randomWallet.privateKey
    );

    return this.buildAriaWallet(account, mnemonic);
  }

  /**
   * Generate a mnemonic and return ArianeeProtocol
   * @param data
   */
  public fromRandomMnemonic(): ArianeeWallet {
    return this.fromRandomKey();
  }

  /**
   *  From a mnemonic and return ArianeeProtocol
   * @param mnemonic
   */
  public fromMnemonic(mnemonic: string): ArianeeWallet {
    const isValidMnemonic = ethers.utils.HDNode.isValidMnemonic(mnemonic);
    if (isValidMnemonic) {
      const {privateKey} = etherWallet.fromMnemonic(mnemonic);
      const account = this.web3.eth.accounts.privateKeyToAccount(privateKey);

      return this.buildAriaWallet(account, mnemonic);
    } else {
      throw new Error("invalid mnemonic");
    }
  }

  /**
   *  From privatekey and return ArianeeProtocol
   * @param privateKey
   */
  public fromPrivateKey(privateKey: string): ArianeeWallet {
    const account = this.web3.eth.accounts.privateKeyToAccount(privateKey);

    return this.buildAriaWallet(account);
  }
}
