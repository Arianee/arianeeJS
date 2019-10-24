import {Arianee, NETWORK} from "../../../src";
import {ArianeeWallet} from "../../../src/core/wallet";

export const makeWalletReady = async (wallet: ArianeeWallet
): Promise<ArianeeWallet> => {

  await wallet.requestPoa();
  await wallet.requestAria();

  await wallet.ariaContract.methods
    .approve(
      wallet.storeContract.options.address,
      "10000000000000000000000000000"
    )
    .send();

  return wallet;
};