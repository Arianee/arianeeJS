import { injectable } from 'tsyringe';
import { ArianeeHttpClient } from '../../../libs/arianeeHttpClient/arianeeHttpClient';
import { ConfigurationService } from '../configurationService/configurationService';
import { WalletService } from '../walletService/walletService';
import { ArianeeAccessTokenCreatorService } from '../ArianeeAccessToken/arianeeAccessTokenCreatorService';

@injectable()
export class POAAndAriaService {
  constructor (private httpClient:ArianeeHttpClient,
                private configurationService:ConfigurationService,
                private walletService:WalletService,
               private arianeeAccessTokenCreatorService:ArianeeAccessTokenCreatorService
  ) {}

    public requestPoa = async (): Promise<any> => {
      const aat = await this.arianeeAccessTokenCreatorService.createWalletAccessToken();
      const httpClientOptions:any = {
        headers: {
          aat
        }
      };

      if (this.configurationService.arianeeConfiguration.jwtGetter) {
        httpClientOptions.headers.Authorization = await this.configurationService.arianeeConfiguration.jwtGetter(aat);
      }

      const url = this.configurationService.arianeeConfiguration.faucetUrl +
          '&address=' +
          this.walletService.account.address;
      try {
        return await this.httpClient.fetch(url, httpClientOptions);
      } catch (e) {
        console.warn(e);
        const message = `An error occured when requesting POA. url: ${url}`;
        console.warn(message);
        throw new Error(message);
      }
    }

    public requestAria = async (): Promise<any> => {
      const aat = await this.arianeeAccessTokenCreatorService.createWalletAccessToken();
      const httpClientOptions:any = {
        headers: {
          aat
        }
      };

      if (this.configurationService.arianeeConfiguration.jwtGetter) {
        httpClientOptions.headers.Authorization = await this.configurationService.arianeeConfiguration.jwtGetter(aat);
      }

      const url = this.configurationService.arianeeConfiguration.faucetUrl +
          '&address=' +
          this.walletService.account.address +
          '&aria=true';
      try {
        return await this.httpClient.fetch(url, httpClientOptions);
      } catch (e) {
        console.warn(e);
        const message = `An error occured when requesting Aria. url: ${url}`;
        console.warn(message);
        throw new Error(message);
      }
    }
}
