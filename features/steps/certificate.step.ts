import { expect } from "chai";
import { Given, Then, When } from "cucumber";
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

When(
  "user{int} create a proof in certificate{int} with passphrase {word}",
  async function (userIndex, tokenIndex, password) {
    const tokenId = this.store.getToken(tokenIndex);
    const wallet = this.store.getUserWallet(userIndex);

    const linkObject = await wallet.methods.createCertificateProofLink(tokenId, password);

    expect(linkObject.passphrase).equals(password);
    expect(linkObject.tokenId).equals(tokenId);
    expect(linkObject.link).contain(tokenId);
    expect(linkObject.link).contain(password);
  }
);

Then(
  "user{int} can check the proof in certificate{int} with passphrase {word}",
  async function (userIndex, certificateIndex, password) {
    const wallet = this.store.getUserWallet(userIndex);
    const tokenId = this.store.getToken(certificateIndex);

    const proofIsValid = await wallet.methods.isCertificateProofValid(tokenId, password);

    expect(proofIsValid).equals(true);
  }
);

Then(
  "user{int} cannot check the proof in certificate{int} with passphrase {word}",
  async function (userIndex, certificateIndex, password) {
    const wallet = this.store.getUserWallet(userIndex);
    const tokenId = this.store.getToken(certificateIndex);

    try {
      const proofIsValid = await wallet.methods.isCertificateProofValid(tokenId, password);
      expect(true).equals(false);
    }
    catch{
      expect(true).equals(true);
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
  });

Given("user{int} makes certificate{int} {word} without passphrase",
  async function (userIndex, tokenIndex, actionType, ) {
    const wallet = this.store.getUserWallet(userIndex);
    const tokenId = this.store.getToken(tokenIndex);

    const linkObject = await wallet.methods.createCertificateTransferLink(tokenId);
    this.store.storeCustom('linkObject', linkObject);

    return;
  });

Given("user{int} requests certificate{int} with the link",
  async function (userIndex, tokenIndex) {
    const wallet = this.store.getUserWallet(userIndex);
    const tokenId = this.store.getToken(tokenIndex);

    const linkObject = this.store.getCustom('linkObject');

    await wallet.methods.requestToken(linkObject.tokenId, linkObject.passphrase);

    return;
  });

Given("user{int} checks if certificate{int} can be requested with passphrase {word}",
  async function (userIndex, tokenIndex, passphrase) {
    const wallet = this.store.getUserWallet(userIndex);
    const tokenId = this.store.getToken(tokenIndex);

    const isRequestable = await wallet.methods.isCertificateRequestable(tokenId, passphrase);
    expect(isRequestable).equal(true);

    return;
  });

Given("user{int} checks if certificate{int} can not be requested with passphrase {word}",
  async function (userIndex, tokenIndex, passphrase) {
    const wallet = this.store.getUserWallet(userIndex);
    const tokenId = this.store.getToken(tokenIndex);

    const isRequestable = await wallet.methods.isCertificateRequestable(tokenId, passphrase);
    expect(isRequestable).equal(false);

    return;
  });

Given("user{int} want to see certificate{int} details with passphrase {word}",
  async function (userIndex, tokenIndex, passphrase) {
    const wallet = this.store.getUserWallet(userIndex);
    const tokenId = this.store.getToken(tokenIndex);

    const certficiateDetails = await wallet.methods.getCertificate(tokenId, passphrase);
    expect(certficiateDetails).to.be.not.undefined;

    expect(certficiateDetails.content).to.be.not.undefined;
    expect(certficiateDetails.events).to.be.not.undefined;
    expect(certficiateDetails.issuer).to.be.not.undefined;
    expect(certficiateDetails.owner).to.be.not.undefined;

    return;
  });