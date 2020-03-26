import { expect } from 'chai';
import { Given } from 'cucumber';

Given('user{int} creates an event{int} with title {string} on certificate{int}', async function (
  userIndex, eventIndex, title, certificateIndex
) {
  const wallet = this.store.getUserWallet(userIndex);
  const certificateId = this.store.getToken(certificateIndex);

  const { arianeeEventId } = await wallet.methods.createArianeeEvent({
    certificateId,
    content: {
      title,
      $schema: 'https://cert.arianee.org/version1/ArianeeEvent-i18n.json'
    }
  });

  this.store.storeEvent(eventIndex, arianeeEventId);
});

Given('user{int} createsAndStores an event{int} with title {string} on certificate{int}', async function (
  userIndex, eventIndex, title, certificateIndex
) {
  const wallet = this.store.getUserWallet(userIndex);
  const certificateId = this.store.getToken(certificateIndex);

  const { arianeeEventId } = await wallet.methods.createAndStoreArianeeEvent({
    certificateId,
    content: {
      title,
      $schema: 'https://cert.arianee.org/version1/ArianeeEvent-i18n.json'
    }
  }, `https://arianee.cleverapps.io/${process.env.NETWORK}/rpc`
  );

  this.store.storeEvent(eventIndex, arianeeEventId);
});

Given('user{int} accepts event{int}', async function (
  userIndex, eventIndex
) {
  const wallet = this.store.getUserWallet(userIndex);
  const arianeeEventId = this.store.getEvent(eventIndex);

  await wallet.methods.acceptArianeeEvent(arianeeEventId);
});

Given('user{int} refuses event{int}', async function (
  userIndex, eventIndex
) {
  const wallet = this.store.getUserWallet(userIndex);
  const arianeeEventId = this.store.getEvent(eventIndex);

  await wallet.methods.refuseArianeeEvent(arianeeEventId);
});

Given('user{int} checks event{int} status is {string} on certificate{int}', async function (
  userIndex, eventIndex, status, certificateIndex
) {
  const wallet = this.store.getUserWallet(userIndex);
  const certificateId = this.store.getToken(certificateIndex);
  const arianeeEventId = this.store.getEvent(eventIndex);

  if (status === 'accepted') {
    const eventsLength:number = await wallet.contracts.eventContract.methods.eventsLength(certificateId).call() as any;

    let isIncluded = false;
    for (let index = 0; index < eventsLength; index++) {
      const event = await wallet.contracts.eventContract.methods
        .tokenEventsList(certificateId, index).call();

      if (event.toString() === arianeeEventId.toString()) {
        isIncluded = true;
        break;
      }
    }

    expect(isIncluded === true).to.be.true;
  } else if (status === 'refused') {
    try {
      await wallet.contracts.eventContract.methods.getEvent(arianeeEventId).call();
      expect(true).to.be.false;
    } catch (err) {
      expect(true).to.be.true;
    }
  } else if (status === 'pending') {
    const eventsLength:number = await wallet.contracts.eventContract.methods.pendingEventsLength(certificateId).call() as any;

    let isIncluded = false;
    for (let index = 0; index < eventsLength; index++) {
      const event = await wallet.contracts.eventContract.methods
        .pendingEvents(certificateId, index).call();

      if (event.toString() === arianeeEventId.toString()) {
        isIncluded = true;
        break;
      }
    };
    expect(isIncluded === true).to.be.true;
  } else {
    throw new Error('status is undefined or not known');
  }
});
