import { expect } from "chai";
import { Given, Then } from "cucumber";
import { Arianee } from "../../src";
import { ArianeeWallet } from "../../src/core/wallet";
import { ArianeeWalletBuilder } from "../../src/core/wallet/walletBuilder";
import { CreateWalletWithPOAAndAria } from "../../src/e2e/utils/create-wallet";

Given("user{int} has a valid wallet", async function (userIndex) {
  const wallet = this.store.getUserWallet(userIndex);

  expect(wallet instanceof ArianeeWallet).equals(true);

  return Promise.resolve();
});

const walletFactory = (arianee: ArianeeWalletBuilder, type: string, key?) => {
  let wallet: ArianeeWallet;
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
  } else if (type === 'fromRandomMnemonic') {
    wallet = arianee.fromRandomMnemonic();
  } else {
    const message = `this method to create a account is not supported ${type}`;
    throw new Error(message);
  }

  return wallet;
};

Given("user{int} with account from {word} {word}", async function (
  userIndex,
  type,
  key
) {
  const arianee = await new Arianee().init();

  let wallet = walletFactory(arianee, type, key);

  this.store.storeWallet(userIndex, wallet);

  return Promise.resolve();
});

Given("user{int} with account from {word} {string}", async function (
  userIndex,
  type,
  key
) {
  const arianee = await new Arianee().init();

  let wallet = walletFactory(arianee, type, key);

  this.store.storeWallet(userIndex, wallet);

  return Promise.resolve();
});

Given("user{int} can retrieve its mnemonic", async function (userIndex) {
  const wallet: ArianeeWallet = this.store.getUserWallet(userIndex);
  expect(wallet.mnemnonic).to.not.be.undefined;

  return;
});

Given("user{int} has positive credits of POA and ARIA", async function (userIndex) {
  const wallet: ArianeeWallet = this.store.getUserWallet(userIndex);
  await wallet.requestPoa();

  await wallet.requestAria();

  return;
});

Given("user{int} with account from {word}", async function (userIndex, type) {
  const arianee = await new Arianee().init();

  let wallet = walletFactory(arianee, type);

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
});
