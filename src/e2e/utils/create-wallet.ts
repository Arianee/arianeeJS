import { ArianeeWallet } from "../../core/wallet";
import { waitFor } from "../../../features/steps/helpers/waitFor";
import * as assert from "assert";
import { Arianee } from "../../core/arianee";

export async function CreateWalletWithPOAAndAria(
  fromPrivateKey?: string,
  force = false
): Promise<ArianeeWallet> {
  let wallet;
  const arianee = new Arianee()
  const walletMaker=await arianee.connectToProtocol()
  if (fromPrivateKey) {
    wallet = walletMaker.fromPrivateKey(fromPrivateKey);
  } else {
    wallet = walletMaker.fromRandomKey();
  }

  let [ariaBalance, poaBalance] = await Promise.all([
    await wallet.ariaContract.methods.balanceOf(wallet.publicKey).call(),
    wallet.web3.eth.getBalance(wallet.publicKey)
  ]);

  if (poaBalance == 0 || force) {
    await wallet.getFaucet();

    await waitFor(7000);
    ariaBalance = await wallet.web3.eth.getBalance(wallet.publicKey);
    assert.ok(ariaBalance > 0, `POA faucet not working.`);
  }

  if (poaBalance == 0 || force) {
    await wallet
      .getAria()

    await waitFor(7000);
    poaBalance = await wallet.ariaContract.methods
      .balanceOf(wallet.publicKey)
      .call();

    assert.ok(poaBalance > 0, "aria faucet not working");
  }

  await wallet.ariaContract.methods
    .approve(
      wallet.storeContract.options.address,
      "10000000000000000000000000000"
    )
    .send();

  await waitFor(7000);

  return wallet;
}
