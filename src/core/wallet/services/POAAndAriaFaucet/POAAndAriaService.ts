import { injectable } from 'tsyringe';
import { ArianeeHttpClient } from '../../../libs/arianeeHttpClient/arianeeHttpClient';
import { ConfigurationService } from '../configurationService/configurationService';
import { WalletService } from '../walletService/walletService';
import { NETWORK } from '../../../../models/networkConfiguration';

@injectable()
export class POAAndAriaService {
  constructor (private httpClient:ArianeeHttpClient,
                private configurationService:ConfigurationService,
                private walletService:WalletService
  ) {}

  /**
   * @deprecated Method requestPoa is deprecated and should not be used anymore. The funding is automatic if you are using Arianee gateways.
   */
    public requestPoa = async (): Promise<any> => {
      console.warn('Method requestPoa is deprecated and should not be used anymore. The funding is automatic if you are using Arianee gateways.');
      return true;
    }

    public requestAria = async (): Promise<any> => {
      try {
        if (![NETWORK.testnet, NETWORK.arianeeTestnet].includes(this.configurationService.arianeeConfiguration.networkName)) {
          throw new Error('You are not on the testnet network');
        }
        const url = `https://faucet.arianee.net/faucet/testnet/${this.walletService.account.address}/aria`;
        return await this.httpClient.fetch(url);
      } catch (e) {
        const message = `An error occured when requesting Aria. ${e}`;
        console.warn(message);
        throw new Error(message);
      }
    }
}
