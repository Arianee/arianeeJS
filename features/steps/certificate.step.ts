import { Given, Then, When } from "cucumber";
import { expect } from "chai";
import { waitFor } from "./helpers/waitFor";

Given("user{int} has positive credit certificate balance", async function (
  userIndex
) {
  const wallet = this.store.getUserWallet(userIndex);
  const address = wallet.account.address;
  const balance = await wallet.creditHistoryContract.methods
    .balanceOf(wallet.publicKey, 0)
    .send();

  expect(balance.toNumber() > 0).equals(true);
});

When(
  "user{int} creates a new certificate{int} with uri {string}",
  { timeout: 45000 },
  async function (userIndex, tokenIndex, uri) {
    const wallet = this.store.getUserWallet(userIndex);
    const hash = wallet.web3.utils.keccak256("ezofnzefon");

    try {
      const { tokenId } = await wallet.methods.hydrateToken({
        uri: uri,
        hash
      });

      await waitFor();

      this.store.storeToken(tokenIndex, tokenId);

      expect(true).equals(true);
    } catch (err) {
      console.error("ERROR");
      expect(true).equals(false);
    }
  }
);

When(
  "user{int} creates a new certificate{int} with uri {string} and passphrase {word}",
  { timeout: 45000 },

  async function (userIndex, tokenIndex, uri, password) {
    const wallet = this.store.getUserWallet(userIndex);

    const hash = wallet.web3.utils.keccak256("ezofnzefon");
    try {
      const { tokenId } = await wallet.methods.hydrateToken({
        uri: uri,
        hash,
        passphrase: password
      });

      await waitFor();

      this.store.storeToken(tokenIndex, tokenId);

      expect(true).equals(true);
    } catch (err) {
      console.error("ERROR");
      expect(true).equals(false);
    }
  }
);

Then("user{int} is the owner of the certificate{int}", async function (
  userIndex,
  certificateIndex
) {
  const token = this.store.getToken(certificateIndex);
  const wallet = this.store.getUserWallet(userIndex);

  const owner = await wallet.smartAssetContract.methods.ownerOf(token).call();
  expect(wallet.publicKey).equals(owner);
});

Then(
  "user{int} is the owner of the certificate{int} with uri {string}",
  async function (userIndex, tokenIndex, expectedUri) {
    const token = this.store.getToken(tokenIndex);
    const wallet = this.store.getUserWallet(userIndex);

    const owner = await wallet.smartAssetContract.methods.ownerOf(token).call();

    expect(wallet.publicKey).equals(owner);

    const uriKey = await wallet.smartAssetContract.methods
      .tokenURI(token)
      .call();

    expect(expectedUri).equals(uriKey);
  }
);

Given("user{int} requests certificate{int} with passprase {word}",
  async function (userIndex, tokenIndex, passphrase) {
    const wallet = this.store.getUserWallet(userIndex);
    const tokenId = this.store.getToken(tokenIndex);
    await wallet.methods.requestToken(tokenId, passphrase);
    await waitFor();
  }
);

Given("user{int} makes certificate{int} {word} with passphrase {word}",
  async function (userIndex, tokenIndex, actionType, passphrase) {
    const wallet = this.store.getUserWallet(userIndex);
    const tokenId = this.store.getToken(tokenIndex);

    return wallet.methods.createCertificateTransferLink(tokenId, passphrase);
  })

Given("user{int} makes certificate{int} {word} without passphrase",
  async function (userIndex, tokenIndex, actionType, ) {
    const wallet = this.store.getUserWallet(userIndex);
    const tokenId = this.store.getToken(tokenIndex);

    const linkObject = await wallet.methods.createCertificateTransferLink(tokenId);
    this.store.storeCustom('linkObject', linkObject);
    return;
  })

  Given("user{int} requests certificate{int} with the link",
  async function (userIndex, tokenIndex) {
    const wallet = this.store.getUserWallet(userIndex);
    const tokenId = this.store.getToken(tokenIndex);

   const linkObject =this.store.getCustom('linkObject');

   await wallet.methods.requestToken(linkObject.tokenId, linkObject.passphrase);

    return;
  })

