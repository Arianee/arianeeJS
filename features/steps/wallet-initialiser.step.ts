import { Given, Then } from "cucumber";
import { expect } from "chai";
import { ArianeeWallet } from "../../src/core/wallet";
import { waitFor } from "./helpers/waitFor";
import { Arianee } from "../../src";
import { CreateWalletWithPOAAndAria } from "../../src/e2e/utils/create-wallet";

Given("user{int} has a valid wallet", async function (userIndex) {
  const wallet = this.store.getUserWallet(userIndex);

  expect(wallet instanceof ArianeeWallet).equals(true);

  return Promise.resolve();
});

Given("user{int} with account from {word} {word}", async function (
  userIndex,
  type,
  key
) {
  let wallet;
  const arianee = await new Arianee().connectToProtocol();

  if (type === "randomKey") {
    wallet = arianee
      .fromRandomKey();
  } else if (type === "privateKey") {
    wallet = arianee
      .fromPrivateKey(key);
  } else if (type === "mnemonic") {
    wallet = arianee
      .fromMnemonic(key);
  } else if (type === 'fromPassPhrase') {
    wallet = arianee
      .fromPassPhrase(key);
  } else {
    throw new Error("this method to create a account is not supported");
  }

  this.store.storeWallet(userIndex, wallet);

  return Promise.resolve();
});

Given("user{int} has positive credits of POA and ARIA", async function (userIndex) {
  const wallet: ArianeeWallet = this.store.getUserWallet(userIndex);
  await wallet.getFaucet();
  await waitFor();
  await wallet.getAria();
  await waitFor();
  return;
})


Given("user{int} with account from {word}",async function (userIndex, type) {
  let wallet;
  const arianee = await new Arianee().connectToProtocol();

  if (type === "randomKey") {
    wallet = arianee
      .fromRandomKey()
  } else {
    throw new Error("this method to create a account is not supported");
  }

  this.store.storeWallet(userIndex, wallet);

  return Promise.resolve();
});

Given("user{int} can approve storeContract", async function (userIndex) {
  const wallet = this.store.getUserWallet(userIndex);
  await wallet.ariaContract.methods
    .approve(
      wallet.storeContract.options.address,
      "10000000000000000000000000000"
    )
    .send();

  return Promise.resolve();
});


Given('user{int} is a brand', async function (userIndex) {
  const wallet = await CreateWalletWithPOAAndAria();
  this.store.storeWallet(userIndex, wallet);
  return;
})