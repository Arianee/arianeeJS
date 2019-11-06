import { injectable } from 'tsyringe';
import { ArianeeHttpClient } from '../../../libs/arianeeHttpClient/arianeeHttpClient';
import { ConfigurationService } from '../configurationService/configurationService';
import { WalletService } from '../walletService/walletService';

@injectable()
export class POAAndAriaService {
  constructor (private httpClient:ArianeeHttpClient,
                private configurationService:ConfigurationService,
                private walletService:WalletService) {}

    public requestPoa = (): Promise<any> => {
      return this.httpClient.fetch(
        this.configurationService.arianeeConfiguration.faucetUrl +
            '&address=' +
            this.walletService.account.address
      );
    }

    public requestAria = (): Promise<any> => {
      return this.httpClient.fetch(
        this.configurationService.arianeeConfiguration.faucetUrl +
            '&address=' +
            this.walletService.account.address +
            '&aria=true'
      );
    }
}
