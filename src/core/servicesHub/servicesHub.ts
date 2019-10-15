import { ArianeeConfig } from "../../models/arianeeConfiguration";
import { ArianeeContractBuilder } from "../libs/arianee-contract-builder";
import { ArianeeWalletBuilder } from "../wallet/walletBuilder";
import { ArianeeHttpClient } from "./services/arianeeHttpClient";
import { ArianeeRPC } from "./services/ArianeeRPCClient";

export class ServicesHub {
  public RPC: ArianeeRPC = new ArianeeRPC();
  private arianeeHttpClient = new ArianeeHttpClient();

  constructor(
    private _contracts: ArianeeContractBuilder,
  ) { }

  public get arianeeConfig(): ArianeeConfig {
    return this._contracts.arianeeConfig;
  }

  public walletFactory() {
    return new ArianeeWalletBuilder(this.arianeeConfig);
  }
  public get httpClient() {
    return this.arianeeHttpClient;
  }

  public get web3() {
    return this._contracts.web3;
  }

  public get contracts() {
    return this._contracts;
  }
}
