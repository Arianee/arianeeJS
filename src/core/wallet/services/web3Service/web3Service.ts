import { injectable } from 'tsyringe';
import Web3 from 'web3';
import { ConfigurationService } from '../configurationService/configurationService';

@injectable()
export class Web3Service {
  constructor (private configurationService: ConfigurationService) {
    this.web3 = new Web3(configurationService.arianeeConfiguration.web3Provider);
  }

    public web3: any
}
