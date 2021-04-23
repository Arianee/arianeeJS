import { Cert } from '@0xcert/cert';
import { injectable } from 'tsyringe';
import { Sign, SignedTransaction, Transaction } from 'web3-core';

import { NETWORK } from '../../../..';
import { ArianeeConfig } from '../../../../models/arianeeConfiguration';
import { ArianeeHttpClient } from '../../../libs/arianeeHttpClient/arianeeHttpClient';
import { ConfigurationService } from '../configurationService/configurationService';

import { WalletService } from '../walletService/walletService';
import { Web3Service } from '../web3Service/web3Service';

@injectable()
export class UtilsService {
  constructor (
      private web3Service: Web3Service,
      private configurationService: ConfigurationService,
      private walletService: WalletService,
      private httpService: ArianeeHttpClient
  ) {
  }

  private get web3 () {
    return this.web3Service.web3;
  }

  public signProofForRequestToken (
    certificateId: number,
    addressNextOwner: string,
    privateKeyPreviousOwner: string
  ) {
    const data = this.web3.utils.keccak256(
      this.web3.eth.abi.encodeParameters(
        ['uint', 'address'],
        [certificateId, addressNextOwner]
      )
    );

    return this.walletService.signProof(data, privateKeyPreviousOwner);
  }

  public signProofForRpc (certificateId: number, privateKey: string) {
    const message = {
      certificateId: certificateId,
      timestamp: new Date()
    };

    return this.walletService.signProof(JSON.stringify(message), privateKey);
  }

  public simplifiedParsedURL (url: string) {
    const m = url.match(
      /^(([^:/?#]+:)?(?:\/\/((?:([^/?#:]*):([^/?#:]*)@)?([^/?#:]*)(?::([^/?#:]*))?)))?([^?#]*)(\?[^#]*)?(#.*)?$/
    );
    const r = {
      hash: m[10] || '',
      hostname: m[6] || '',
      pathname: m[8] || (m[1] ? '/' : ''),
      port: m[7] || '',
      protocol: m[2] || '',
      search: m[9] || '',
      username: m[4] || '',
      password: m[5] || ''
    };

    return m && r;
  }

  public createUID ():number {
    return Math.ceil(Math.random() * 1000000000);
  }

  public createPassphrase () {
    return (
      Math.random()
        .toString(36)
        .substring(2, 8) +
      Math.random()
        .toString(36)
        .substring(2, 8)
    );
  }

  public recover (data: string | Array<any>, signature: string):string {
    return this.web3.eth.accounts.recover(<string>data, signature);
  }

  /**
   * Calculate imprint from JSON (identity, certificate...etc)
   * @param {{$schema: string; [p: string]: any}} content
   * @returns {Promise<string>}
   */
  public calculateImprint = async (content: { $schema: string, [key: string]: any }):Promise<string> => {
    const $schema = await this.httpService.fetch(content.$schema);

    return this.cert($schema, content);
  };

  public async cert (schema, data): Promise<string> {
    const cert = new Cert({
      schema: schema
    });

    const cleanData = this.cleanObject(data);

    const certif = await cert.imprint(cleanData);

    return '0x' + certif;
  }

  private cleanObject (obj: any) {
    for (const propName in obj) {
      if (
        obj[propName] &&
        obj[propName].constructor === Array &&
        obj[propName].length === 0
      ) {
        delete obj[propName];
      }
    }

    return obj;
  }

  /**
   * Function to find if hostname match deeplink or alternative deeplink of an ArianeeConfiguration
   * @param hostname
   * @param arianeeConfig
   */
  private findHostNameInConfig (hostname:string, arianeeConfig:ArianeeConfig) {
    const isCurrentConfigDeeplink = arianeeConfig.deepLink === hostname;

    const isCurrentConfigAlternativeDeeplinks = arianeeConfig
      .alternativeDeeplink
      .find(theDeepLink => theDeepLink === hostname);

    const isCurrentConfig = isCurrentConfigDeeplink || isCurrentConfigAlternativeDeeplinks;

    if (isCurrentConfig) {
      return arianeeConfig.networkName;
    }
  }

  /**
   * Function. Pass a deeplink hostname, and find the right network according to configuration
   * @param hostname
   * @returns {NETWORK} network name of this deeplink hostname. If no network associated with this hostname, it returns
   * undefined
   */
  public findChainFromHostname (hostname):NETWORK {
    const networkConfigurations = this.configurationService.supportedConfigurations;
    const networks = Object.keys(this.configurationService.supportedConfigurations) as Array<NETWORK>;

    // check if it matches any of current configuration
    const isCurrentConfigurationNetwork = this.findHostNameInConfig(hostname, this
      .configurationService
      .arianeeConfiguration);

    if (isCurrentConfigurationNetwork) {
      return this.configurationService.arianeeConfiguration.networkName;
    }

    // check if it match any of supported configuration
    return networks.find(key => {
      const config = networkConfigurations[key];
      const network = this.findHostNameInConfig(hostname, config);

      if (network) {
        return true;
      } else {
        return false;
      }
    });
  }

  /**
   * Function. Pass a deeplink hostname.
   * @param hostname
   * @returns {true} it return true if arianeejs is initiated on the right network otherwise it thrown an error
   * with the most likely chainName
   */
  public isRightChain (hostname: string):boolean {
    const rightChain = this.findChainFromHostname(hostname);

    if (rightChain) {
      const currentNetworkName = this.configurationService.arianeeConfiguration.networkName;
      if (rightChain === currentNetworkName) {
        return true;
      }
    }

    const error = new Error('You are not in the right chain');
    error.message = 'You are not in the right chain';
    (error as any).chain = rightChain;
    throw error;
  }

  public createLink (
    certificateId: number,
    passphrase: string,
    suffix?: string
  ): { certificateId: number; passphrase: string; link: string } {
    let link = `https://${this.configurationService.arianeeConfiguration.deepLink}`;

    if (suffix) {
      link = link + '/' + suffix;
    }

    link = link + `/${certificateId},${passphrase}`;

    return {
      certificateId: certificateId,
      passphrase: passphrase,
      link
    };
  }

  public readLink (link) {
    const url = this.simplifiedParsedURL(link);
    this.isRightChain(url.hostname);

    const methodUrl = url.pathname.split('/');

    const pathName = methodUrl[methodUrl.length - 1];

    const certificateId = parseInt(pathName.split(',')[0]);
    const passphrase = pathName.split(',')[1];

    let method = 'requestOwnership';

    if (methodUrl.length > 2) method = methodUrl[1];

    return {
      method: method,
      certificateId: certificateId,
      passphrase
    };
  }

  public timestampIsMoreRecentThan= UtilsService.timestampIsMoreRecentThan;

  public static timestampIsMoreRecentThan (timestamp, seconds) {
    const date = new Date().valueOf();
    const minTime = date - seconds * 1000;

    return timestamp > minTime / 1000;
  }

  public async getTimestampFromBlock (blockNumber) {
    const block = await this.web3Service.web3.eth.getBlock(
      blockNumber
    );
    return block.timestamp;
  }

  public async prepareTransaction (encodeABI, contractAddress, overrideNonce?, transaction?):Promise<Transaction> {
    const nonce = overrideNonce || await this.web3.eth.getTransactionCount(
      this.walletService.address,
      'pending'
    );

    const defaultTransaction = {
      nonce,
      chainId: this.configurationService.arianeeConfiguration.chainId,
      from: this.walletService.address,
      data: encodeABI,
      to: contractAddress,
      gasLimit: this.configurationService.arianeeConfiguration.transactionOptions.gas,
      gasPrice: this.configurationService.arianeeConfiguration.transactionOptions.gasPrice
    };

    const mergedTransaction = { ...defaultTransaction, ...transaction };

    return mergedTransaction;
  }
}
