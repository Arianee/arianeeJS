import { expect } from 'chai';
import { Given } from 'cucumber';

Given('user{int} looses certificate{int}', async function (
  userIndex, certificateIndex
) {
  const wallet = this.store.getUserWallet(userIndex);
  const certificateId = this.store.getToken(certificateIndex);

  await wallet.contracts.lostContract.methods.setLost(certificateId).send();
});

Given('user{int} retrieves certificate{int}', async function (
  userIndex, certificateIndex
) {
  const wallet = this.store.getUserWallet(userIndex);
  const certificateId = this.store.getToken(certificateIndex);

  await wallet.contracts.lostContract.methods.unsetLost(certificateId).send();
});

Given('user{int} can see certificate{int} lost status is {word}', async function (
  userIndex, certificateIndex, expectedValue
) {
  const wallet = this.store.getUserWallet(userIndex);
  const certificateId = this.store.getToken(certificateIndex);

  const value = await wallet.contracts.lostContract.methods.isLost(certificateId).call();

  expect(value.toString() === expectedValue.toString()).to.be.true;
});
