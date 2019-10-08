import { Given, Then } from "cucumber";
import { expect } from "chai";
import { ArianeeWallet } from "../../src/core/wallet/arianeeWallet";
import { Arianee } from "../../src";

Given("user{int} has a valid wallet", function (userIndex) {
  const wallet = this.store.getUserWallet(userIndex);

  expect(wallet instanceof ArianeeWallet).equals(true);
  
  return Promise.resolve();
});

Given("user{int} with account from {word} {word}", function (
  userIndex,
  type,
  key
) {
  let wallet;
  if (type === "randomKey") {
    wallet = Arianee()
      .fromRandomKey();
  } else if (type === "privateKey") {
    wallet = Arianee()
      .fromPrivateKey(key);
  } else if (type === "mnemonic") {
    wallet = Arianee()
      .fromMnemonic(key);
  } else if (type === 'fromPassPhrase') {
    wallet = Arianee()
      .fromPassPhrase(key);
  } else {
    throw new Error("this method to create a account is not supported");
  }
  this.store.storeWallet(userIndex, wallet);

  return Promise.resolve();
});

Given("user{int} with account from {word}", function (userIndex, type) {
  let wallet;
  if (type === "randomKey") {
    wallet = Arianee()
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
