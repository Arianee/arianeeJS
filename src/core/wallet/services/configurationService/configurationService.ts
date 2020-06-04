import { assignIn } from 'lodash';
import { injectable } from 'tsyringe';
import Web3 from 'web3';
import configurations from '../../../../configurations/appConfigurations';
import { ArianeeConfig } from '../../../../models/arianeeConfiguration';
import { ArianeeWalletBuilder } from '../../walletBuilder';

@injectable()
export class ConfigurationService {
  private defaultArianeeConfiguration:ArianeeConfig={
    walletReward: { address: '0x39da7e30d2D5F2168AE3B8599066ab122680e1ef' },
    brandDataHubReward: { address: '0xA79B29AD7e0196C95B87f4663ded82Fbf2E3ADD8' },
    transactionOptions: {
      gas: 2000000,
      gasPrice: 1000000000
    }
  } as ArianeeConfig;

  private _arianeeConfiguration:ArianeeConfig;

  public set arianeeConfiguration (value:ArianeeConfig) {
    this._arianeeConfiguration = value;
  }

  public get arianeeConfiguration ():ArianeeConfig {
    return assignIn({}, this.defaultArianeeConfiguration, this._arianeeConfiguration);
  };

  public walletFactory (): ArianeeWalletBuilder {
    return new ArianeeWalletBuilder(this.arianeeConfiguration);
  }

  public static get web3 ():Web3 {
    return Web3 as any;
  }

  public supportedConfigurations=configurations;
}
