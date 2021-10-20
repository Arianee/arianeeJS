import { injectable } from 'tsyringe';
import { GasStationResult } from '../../../../models/gasStationResult';
import { ArianeeHttpClient } from '../../../libs/arianeeHttpClient/arianeeHttpClient';
import { ConfigurationService } from '../configurationService/configurationService';
import web3 from 'web3';

@injectable()
export class GasStationService {
  constructor (private configurationService: ConfigurationService,
              private httpClient: ArianeeHttpClient
  ) {
  };

  public fetchGas = async (): Promise<string> => {
    let gasPrice = this.configurationService.arianeeConfiguration.transactionOptions.gasPrice;
    const { gasStationURL } = this.configurationService.arianeeConfiguration;
    if (gasStationURL) {
      try {
        gasPrice = await this.getGasFromGasPrice(gasStationURL);
      } catch (e) {
        console.error(`unable to fetch data from gas station ${gasStationURL}`);
        console.error(e);
      }
    }

    return gasPrice;
  }

  private async getGasFromGasPrice (gasStationURL: string): Promise<string> {
    const gasStationResult: GasStationResult = await this.httpClient.fetch(gasStationURL);

    const gasPriceInWei = web3.utils.toWei(gasStationResult.standard.toString(), 'gwei');
    const gasPriceWith20percentMore = web3.utils.toBN(gasPriceInWei)
      .mul(web3.utils.toBN('12'))
      .div(web3.utils.toBN('10'));

    return gasPriceWith20percentMore.toString();
  }
}
