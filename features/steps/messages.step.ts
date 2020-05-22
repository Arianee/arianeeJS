import { expect } from 'chai';
import { When, Given } from 'cucumber';

Given('user{int} send a message{int} on certificate{int} as:', async function (
  userIndex, messageIndex, certificateIndex, messageContentSTR
) {
  const wallet = this.store.getUserWallet(userIndex);
  const certificateId = this.store.getToken(certificateIndex);

  const messageContent = JSON.parse(messageContentSTR);

  const { messageId } = await wallet.methods.sendMessage({
    certificateId,
    content: messageContent
  });

  
});
