import {Arianee, NETWORK} from "../../../src";
import {ArianeeWallet} from "../../../src/core/wallet";

export const makeWalletReady = async (wallet: ArianeeWallet
): Promise<ArianeeWallet> => {

  await Promise.all([wallet.requestPoa(), wallet.requestAria()]);

  await wallet.methods.approveStore();

  return wallet;
};
