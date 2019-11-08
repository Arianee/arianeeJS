import { container, singleton } from 'tsyringe';
import { ArianeeConfig } from '../../../../models/arianeeConfiguration';
import { ArianeeWalletBuilder } from '../../walletBuilder';
import configurations from '../../../../configurations/appConfigurations';

@singleton()
export class ConfigurationService {
  public arianeeConfiguration: ArianeeConfig;

  public walletFactory (): ArianeeWalletBuilder {
    return new ArianeeWalletBuilder(this.arianeeConfiguration);
  }

  public supportedConfigurations=configurations;
}
