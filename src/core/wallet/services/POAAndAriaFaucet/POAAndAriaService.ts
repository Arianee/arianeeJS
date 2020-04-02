import { injectable } from 'tsyringe';
import { ArianeeHttpClient } from '../../../libs/arianeeHttpClient/arianeeHttpClient';
import { ConfigurationService } from '../configurationService/configurationService';
import { WalletService } from '../walletService/walletService';

@injectable()
export class POAAndAriaService {
  constructor (private httpClient:ArianeeHttpClient,
                private configurationService:ConfigurationService,
                private walletService:WalletService) {}

    public requestPoa = async (): Promise<any> => {
      const url = this.configurationService.arianeeConfiguration.faucetUrl +
          '&address=' +
          this.walletService.account.address;
      try {
        return await this.httpClient.fetch(url);
      } catch (e) {
        console.warn(e);
        const message = `An error occured when requesting POA. url: ${url}`;
        console.warn(message);
        return Promise.reject(message);
      }
    }

    public requestAria = async (): Promise<any> => {
      const url = this.configurationService.arianeeConfiguration.faucetUrl +
          '&address=' +
          this.walletService.account.address +
          '&aria=true';
      try {
        return await this.httpClient.fetch(url);
      } catch (e) {
        console.warn(e);
        const message = `An error occured when requesting Aria. url: ${url}`;
        console.warn(message);
        return Promise.reject(message);
      }
    }
}
