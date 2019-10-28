import {ArianeeConfig} from "../../models/arianeeConfiguration";
import {HttpClient} from "../../models/httpClient";
import {ArianeeContractBuilder} from "../libs/arianee-contract-builder";
import {ServicesHub} from "./servicesHub";

const Web3 = require("web3");

export class ServicesHubBuilder {
  public httpClient: HttpClient;
  public arianeeConfig: ArianeeConfig;

  public web3;

  public setHttpClient(httpClient: HttpClient) {
    this.httpClient = httpClient;

    return this;
  }

  public setConfig(arianeeConfig: ArianeeConfig) {
    this.web3 = new Web3(arianeeConfig.provider);
    this.arianeeConfig = arianeeConfig;

    return this;
  }

  public build(): ServicesHub {
    const contracts: ArianeeContractBuilder = new ArianeeContractBuilder(this.web3, this.arianeeConfig);

    return new ServicesHub(contracts);
  }
}
