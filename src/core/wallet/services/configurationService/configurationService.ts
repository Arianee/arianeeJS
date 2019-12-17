import { singleton } from 'tsyringe';
import configurations from '../../../../configurations/appConfigurations';
import { ArianeeConfig } from '../../../../models/arianeeConfiguration';
import { ArianeeWalletBuilder } from '../../walletBuilder';

@singleton()
export class ConfigurationService {
  public arianeeConfiguration: ArianeeConfig;

  public walletFactory (): ArianeeWalletBuilder {
    return new ArianeeWalletBuilder(this.arianeeConfiguration);
  }

  public supportedConfigurations=configurations;
}
