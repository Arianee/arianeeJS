import { expect } from "chai";
import { Given, Then, When } from "cucumber";
import { CreateWalletWithPOAAndAria } from "../../src/e2e/utils/create-wallet";
import { waitFor } from "./helpers/waitFor";

When('user{int} claims faucet', async function (userIndex) {
    const wallet = this.store.getUserWallet(userIndex);
    await wallet.getFaucet();

    return waitFor();
});

When('user{int} with valid wallet and aria and faucet', async function (userIndex) {
    const wallet = await CreateWalletWithPOAAndAria();
    this.store.storeWallet(userIndex, wallet);

    return Promise.resolve();
});
When('user{int} claims Aria', async function (userIndex) {
    const wallet = this.store.getUserWallet(userIndex);
    await wallet.getAria();

    return waitFor();
});

When('user{int} buys {int} credit of type {word}', async function (userIndex, quantity, creditType) {
    const creditTypesEnum = {
        creation: 0,
        message: 1,
        event: 2
    };

    if (!creditTypesEnum.hasOwnProperty(creditType)) {
        throw new Error('this credit type does not exist !!! ' + creditType);
    }
    const wallet = this.store.getUserWallet(userIndex);

    await wallet.storeContract.methods
        .buyCredit(creditTypesEnum[creditType], quantity, wallet.publicKey)
        .send();

    return waitFor();
});

Then('user{int} has postive Aria balance', async function (userIndex) {
    const wallet = this.store.getUserWallet(userIndex);

    const balance = await wallet.methods.balanceOfAria();

    expect(+balance > 0).equals(true, `actual aria balance ${balance} and should be positive`);

    return Promise.resolve();
});

Given('user{int} with POA positive balance', async function (userIndex) {
    const wallet = this.store.getUserWallet(userIndex);
    wallet.getFaucet();

    return waitFor();
});

Then('user{int} has postive poa balance', async function (userIndex) {
    const wallet = this.store.getUserWallet(userIndex);
    const balance = await wallet.methods.balanceOfPoa();

    expect(balance > 0).equals(true, `actual value of POA balance ${balance}`);

    return Promise.resolve();
});