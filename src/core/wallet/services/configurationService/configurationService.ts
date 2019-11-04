import { container, singleton } from 'tsyringe';
import { ArianeeConfig } from '../../../../models/arianeeConfiguration';
import { ArianeeWalletBuilder } from '../../walletBuilder';

@singleton()
export class ConfigurationService {
  public arianeeConfiguration: ArianeeConfig;

  public walletFactory (): ArianeeWalletBuilder {
    return new ArianeeWalletBuilder(this.arianeeConfiguration);
  }
}
