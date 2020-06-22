import { expect } from 'chai';
import { When, Given, Then } from 'cucumber';

Given('user{int} send a message{int} on certificate{int} as:', async function (
  userIndex, messageIndex, certificateIndex, messageContentSTR
) {
  const wallet = this.store.getUserWallet(userIndex);
  const certificateId = this.store.getToken(certificateIndex);

  const messageContent = JSON.parse(messageContentSTR);

  try {
    const result = await wallet.methods.createMessage({
      certificateId,
      content: messageContent
    });

    this.store.storeCustom('result', result);
  } catch (err) {
    this.store.storeCustom('result', err);
  }
});

Given('user{int} whitelist user{int} for certificate{int}', async function (
  userIndex, userIndex2, certificateIndex
) {
  const wallet = this.store.getUserWallet(userIndex);
  const wallet2 = this.store.getUserWallet(userIndex2);

  const certificateId = this.store.getToken(certificateIndex);

  try {
    const result = await wallet.contracts.userActionContract.methods.addAddressToWhitelist(certificateId, wallet2.address).send();

    this.store.storeCustom('result', result);
  } catch (err) {
    this.store.storeCustom('result', err);
  }
});

Then('user{int} try to create 2 message with the same message id on certficate{int}',
  async function (userIndex, certificateIndex) {
    const wallet = this.store.getUserWallet(userIndex);
    const certificateId = this.store.getToken(certificateIndex);

    const {messageId} = await wallet.methods.createMessage({
      certificateId,
      content: {
        title: 'title',
        $schema: 'https://cert.arianee.org/version1/ArianeeMessage-i18nAlpha.json'
      }
    });

    try {
      await wallet.methods.createMessage({
        messageId,
        certificateId,
        content: {
          title: 'title',
          $schema: 'https://cert.arianee.org/version1/ArianeeMessage-i18nAlpha.json'
        }
      });
      expect(true).equals(false);
    } catch {
      expect(true).equals(true);
    }
  });
