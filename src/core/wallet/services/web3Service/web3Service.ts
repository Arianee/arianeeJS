import {injectable, singleton} from "tsyringe";
import {ArianeeConfig} from "../../../../models/arianeeConfiguration";
import {ConfigurationService} from "../configurationService/configurationService";
import Web3 = require("web3");

@injectable()
export class Web3Service {

  constructor(private configurationService: ConfigurationService) {
    this.web3 = new Web3(configurationService.arianeeConfiguration.provider);
  }

  public web3: any;
}
