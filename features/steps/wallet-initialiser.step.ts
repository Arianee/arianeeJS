import { expect } from 'chai';
import { Given, Then } from 'cucumber';
import { ArianeeWallet } from '../../src/core/wallet';
import { ArianeeWalletBuilder } from '../../src/core/wallet/walletBuilder';
import { makeWalletReady } from './helpers/walletCreator';

Given('user{int} has a valid wallet', async function (userIndex) {
  const wallet = this.store.getUserWallet(userIndex);

  expect(wallet instanceof ArianeeWallet).equals(true);

  return Promise.resolve();
});

const walletFactory = (arianee: ArianeeWalletBuilder, type: string, key?) => {
  let wallet: ArianeeWallet;
  if (type === 'randomKey') {
    wallet = arianee
      .fromRandomKey();
  } else if (type === 'privateKey') {
    wallet = arianee
      .fromPrivateKey(key);
  } else if (type === 'mnemonic') {
    wallet = arianee
      .fromMnemonic(key);
  } else if (type === 'fromPassPhrase') {
    wallet = arianee
      .fromPassPhrase(key);
  } else if (type === 'fromRandomMnemonic') {
    wallet = arianee.fromRandomMnemonic();
  } else if (type === 'readOnlyWallet') {
    wallet = arianee.readOnlyWallet();
  } else if (type === 'externalWallet') {
    const walletTemp = arianee.fromRandomKey();

    wallet = arianee.fromExternalWallet({
      address: walletTemp.address,
      customSign: (data) => walletTemp.walletservice.sign(data)
    });
  } else {
    const message = `this method to create a account is not supported ${type}`;
    throw new Error(message);
  }

  return wallet;
};

Given('user{int} with account from {word} {word}', async function (
  userIndex,
  type,
  key
) {
  const wallet = walletFactory(this.walletFactory(), type, key);

  this.store.storeWallet(userIndex, wallet);

  return Promise.resolve();
});

Given('user{int} with account from {word} {string}', async function (
  userIndex,
  type,
  key
) {
  const wallet = walletFactory(this.walletFactory(), type, key);

  this.store.storeWallet(userIndex, wallet);

  return Promise.resolve();
});

Given('user{int} can retrieve its mnemonic', async function (userIndex) {
  const wallet: ArianeeWallet = this.store.getUserWallet(userIndex);
  expect(wallet.mnemnonic).to.not.be.undefined;
});

Given('user{int} requests credits of POA and ARIA', async function (userIndex) {
  const wallet: ArianeeWallet = this.store.getUserWallet(userIndex);
  await wallet.requestPoa();

  await wallet.requestAria();
});

Given('user{int} with account from {word}', async function (userIndex, type) {
  const wallet = walletFactory(this.walletFactory(), type);

  this.store.storeWallet(userIndex, wallet);

  return Promise.resolve();
});

Given('user{int} approves storeContract', async function (userIndex) {
  const wallet = this.store.getUserWallet(userIndex);
  await wallet.methods.approveStore();

  return Promise.resolve();
});

Then('storeContract is approved for user{int}', async function (userIndex) {
  const wallet = this.store.getUserWallet(userIndex);

  const allowance = await wallet.contracts.ariaContract.methods.allowance(wallet.address, wallet.configuration.store.address)
    .call();

  expect(allowance).equal('10000000000000000000000000000');
});

Given('user{int} is a brand', async function (userIndex) {
  const wallet = this.walletFactory().fromRandomKey();
  await makeWalletReady(wallet);
  this.store.storeWallet(userIndex, wallet);
});
