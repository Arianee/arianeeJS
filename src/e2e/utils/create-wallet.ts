import * as assert from "assert";
import { waitFor } from "../../../features/steps/helpers/waitFor";
import { Arianee } from "../../core/arianee";
import { ArianeeWallet } from "../../core/wallet";

export async function CreateWalletWithPOAAndAria(
  fromPrivateKey?: string,
  force = false
): Promise<ArianeeWallet> {
  let wallet;
  const arianee = new Arianee();
  const walletMaker = await arianee.connectToProtocol();
  if (fromPrivateKey) {
    wallet = walletMaker.fromPrivateKey(fromPrivateKey);
  } else {
    wallet = walletMaker.fromRandomKey();
  }

  let [ariaBalance, poaBalance] = await Promise.all([
    await wallet.ariaContract.methods.balanceOf(wallet.publicKey).call(),
    wallet.web3.eth.getBalance(wallet.publicKey)
  ]);

  await wallet.getFaucet();

  poaBalance = await wallet.web3.eth.getBalance(wallet.publicKey);
  assert.ok(poaBalance > 0, `POA faucet not working.`);

  if (ariaBalance == 0 || force) {
    await wallet
      .getAria();

    ariaBalance = await wallet.ariaContract.methods
      .balanceOf(wallet.publicKey)
      .call();

    assert.ok(ariaBalance > 0, "aria faucet not working");
  }

  await wallet.ariaContract.methods
    .approve(
      wallet.storeContract.options.address,
      "10000000000000000000000000000"
    )
    .send();

  return wallet;
}
