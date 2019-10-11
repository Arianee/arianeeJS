import { HttpClient } from "../../models/httpClient";
import { ArianeeConfig } from "../../models/arianeeConfiguration";
import { ArianeeContractBuilder } from "../libs/arianee-contract-builder";
import { ServicesHub } from "./servicesHub";

export class ServicesHubBuilder {
  public contracts: ArianeeContractBuilder;
  public httpClient: HttpClient;

  public setHttpClient(httpClient: HttpClient) {
    this.httpClient = httpClient;
    return this;
  }

  public setConfig(ArianeeConfig: ArianeeConfig) {
    this.contracts = new ArianeeContractBuilder(ArianeeConfig);
  }

  public build(): ServicesHub {
    return new ServicesHub(this.contracts, this.httpClient);
  }
}