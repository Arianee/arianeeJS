import {ArianeeWalletBuilder} from "../../../src/core/wallet/walletBuilder";
import {CCStore} from "../helpers/store";

declare module "cucumber" {

  interface World {
    store: CCStore;
    walletFactory: () => ArianeeWalletBuilder;
  }
}
