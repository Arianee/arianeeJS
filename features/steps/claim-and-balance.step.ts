import { expect } from 'chai';
import { Given, Then, When } from 'cucumber';
import { creditTypeEnum } from '../../src/models/creditTypesEnum';
import { makeWalletReady } from './helpers/walletCreator';

When('user{int} claims faucet', async function (userIndex) {
  const wallet = this.store.getUserWallet(userIndex);
  await wallet.requestPoa();
});

When('user{int} with valid wallet and aria and faucet', async function (userIndex) {
  const wallet = this.walletFactory().fromRandomKey();
  await makeWalletReady(wallet);
  this.store.storeWallet(userIndex, wallet);

  return Promise.resolve();
});
When('user{int} claims Aria', async function (userIndex) {
  const wallet = this.store.getUserWallet(userIndex);
  await wallet.requestAria();
});

When('user{int} buys {int} credit of type {word}', async function (userIndex, quantity, creditType) {
  const wallet = this.store.getUserWallet(userIndex);

  await wallet.methods.buyCredits(creditType, quantity, wallet.address);
});

When('user{int} has credit of type {word} balance of {int}', async function (userIndex, creditType, quantity) {
  const wallet = this.store.getUserWallet(userIndex);

  const balance = await wallet.methods.balanceOfCredit(creditType, wallet.address);
  expect(balance).equals(quantity.toString());
});

Then('user{int} has postive Aria balance', async function (userIndex) {
  const wallet = this.store.getUserWallet(userIndex);

  const balance = await wallet.methods.balanceOfAria();

  expect(+balance > 0).equals(true, `actual aria balance ${balance} and should be positive`);

  return Promise.resolve();
});

Given('user{int} with POA positive balance', async function (userIndex) {
  const wallet = this.store.getUserWallet(userIndex);
  wallet.requestPoa();
});

Then('user{int} has postive poa balance', async function (userIndex) {
  const wallet = this.store.getUserWallet(userIndex);
  const balance = await wallet.methods.balanceOfPoa();

  expect(parseInt(balance) > 0).equals(true, `actual value of POA balance ${balance}`);

  return Promise.resolve();
});
