import {expect} from "chai";
import {Given, Then} from "cucumber";
import {ArianeeWallet} from "../../src/core/wallet";
import {ArianeeWalletBuilder} from "../../src/core/wallet/walletBuilder";
import {makeWalletReady} from "./helpers/walletCreator";

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

  let wallet = walletFactory(this.walletFactory(), type, key);

  this.store.storeWallet(userIndex, wallet);

  return Promise.resolve();
});

Given("user{int} with account from {word} {string}", async function (
  userIndex,
  type,
  key
) {

  let wallet = walletFactory(this.walletFactory(), type, key);

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

  let wallet = walletFactory(this.walletFactory(), type);

  this.store.storeWallet(userIndex, wallet);

  return Promise.resolve();
});

Given("user{int} can approve storeContract", async function (userIndex) {
  const wallet = this.store.getUserWallet(userIndex);
  await wallet.methods.approveStore();

  return Promise.resolve();
});

Then('storeContract is approved for user{int}', async function (userIndex) {
  const wallet = this.store.getUserWallet(userIndex);

  const allowance = await wallet.contracts.ariaContract.methods.allowance(wallet.publicKey, wallet.contracts.storeContract.options.address)
    .call();

  expect(allowance).equal('10000000000000000000000000000');
});

Given('user{int} is a brand', async function (userIndex) {
  const wallet = this.walletFactory().fromRandomKey();
  await makeWalletReady(wallet);
  this.store.storeWallet(userIndex, wallet);

  return;
});
