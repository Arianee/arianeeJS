import {expect} from "chai";
import {Given, Then, When} from "cucumber";
import {waitFor} from "./helpers/waitFor";

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
  {timeout: 45000},
  async function (userIndex, tokenIndex, uri) {
    const wallet = this.store.getUserWallet(userIndex);
    const hash = wallet.web3.utils.keccak256("ezofnzefon");

    try {
      const {certificateId} = await wallet.methods.createCertificate({
        uri: uri,
        hash
      });

      await waitFor();

      this.store.storeToken(tokenIndex, certificateId);

      expect(true).equals(true);
    } catch (err) {
      console.error("ERROR");
      expect(true).equals(false);
    }
  }
);

When(
  "user{int} creates a new certificate{int} with uri {string} and passphrase {word}",
  {timeout: 45000},

  async function (userIndex, tokenIndex, uri, password) {
    const wallet = this.store.getUserWallet(userIndex);

    const hash = wallet.web3.utils.keccak256("ezofnzefon");
    try {
      const {certificateId} = await wallet.methods.createCertificate({
        uri: uri,
        hash,
        passphrase: password
      });

      await waitFor();

      this.store.storeToken(tokenIndex, certificateId);

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
    const certificateId = this.store.getToken(tokenIndex);
    const wallet = this.store.getUserWallet(userIndex);

    const linkObject = await wallet.methods.createCertificateProofLink(certificateId, password);

    expect(linkObject.passphrase).equals(password);
    expect(linkObject.certificateId).equals(certificateId);
    expect(linkObject.link).contain(certificateId);
    expect(linkObject.link).contain(password);
  }
);

Then(
  "user{int} can check the proof in certificate{int} with passphrase {word}",
  async function (userIndex, certificateIndex, password) {
    const wallet = this.store.getUserWallet(userIndex);
    const certificateId = this.store.getToken(certificateIndex);

    const proofIsValid = await wallet.methods.isCertificateProofValid(certificateId, password);

    expect(proofIsValid.isTrue).equal(true);
  }
);

Then(
  "user{int} cannot check the proof in certificate{int} with passphrase {word}",
  async function (userIndex, certificateIndex, password) {
    const wallet = this.store.getUserWallet(userIndex);
    const certificateId = this.store.getToken(certificateIndex);

    const proofIsValid = await wallet.methods.isCertificateProofValid(certificateId, password);
    expect(proofIsValid.isTrue).equal(false);

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
    const certificateId = this.store.getToken(tokenIndex);
    await wallet.methods.requestCertificateOwnership(certificateId, passphrase);
    await waitFor();
  }
);

Given("user{int} makes certificate{int} {word} with passphrase {word}",
  async function (userIndex, tokenIndex, actionType, passphrase) {
    const wallet = this.store.getUserWallet(userIndex);
    const certificateId = this.store.getToken(tokenIndex);

    return wallet.methods.createCertificateRequestOwnershipLink(certificateId, passphrase);
  });

Given("user{int} makes certificate{int} {word} without passphrase",
  async function (userIndex, tokenIndex, actionType,) {
    const wallet = this.store.getUserWallet(userIndex);
    const certificateId = this.store.getToken(tokenIndex);

    const linkObject = await wallet.methods.createCertificateRequestOwnershipLink(certificateId);
    this.store.storeCustom('linkObject', linkObject);

    return;
  });

Given("user{int} requests certificate{int} with the link",
  async function (userIndex, tokenIndex) {
    const wallet = this.store.getUserWallet(userIndex);
    const certificateId = this.store.getToken(tokenIndex);

    const linkObject = this.store.getCustom('linkObject');

    await wallet.methods.requestCertificateOwnership(linkObject.certificateId, linkObject.passphrase);

    return;
  });

Given("user{int} checks if certificate{int} can be requested with passphrase {word}",
  async function (userIndex, tokenIndex, passphrase) {
    const wallet = this.store.getUserWallet(userIndex);
    const certificateId = this.store.getToken(tokenIndex);

    const isRequestable = await wallet.methods.isCertificateOwnershipRequestable(certificateId, passphrase);
    expect(isRequestable.isTrue).equal(true);

    return;
  });

Given("user{int} checks if certificate{int} can not be requested with passphrase {word}",
  async function (userIndex, tokenIndex, passphrase) {
    const wallet = this.store.getUserWallet(userIndex);
    const certificateId = this.store.getToken(tokenIndex);

    const isRequestable = await wallet.methods.isCertificateOwnershipRequestable(certificateId, passphrase);
    expect(isRequestable.isTrue).equal(false);

    return;
  });

Given("user{int} want to see certificate{int} details with passphrase {word}",
  async function (userIndex, tokenIndex, passphrase) {
    const wallet = this.store.getUserWallet(userIndex);
    const certificateId = this.store.getToken(tokenIndex);

    const certficiateDetails = await wallet.methods.getCertificate(certificateId, passphrase, {owner: true});
    expect(certficiateDetails).to.be.not.undefined;

    expect(certficiateDetails.owner).to.be.not.undefined;

    return;
  });

Given("user{int} can see its {int} certificates from getMyCertificates",
  async function (userIndex, numberOfCertificates) {
    const wallet = this.store.getUserWallet(userIndex);

    const certificates = await wallet.methods.getMyCertificates(
      {owner: true}
    );

    expect(certificates.length === numberOfCertificates).to.be.true;
    certificates.forEach(certficiateDetails => {
      expect(certficiateDetails.owner).to.be.not.undefined;
    });

    return;
  });

Given("user{int} can see its {int} certificates and {int} issuers from groupByIssuerCertificates",
  async function (userIndex, numberOfCertificates, numberOfBrands) {
    const wallet = this.store.getUserWallet(userIndex);

    const certificatesGroupBy = await wallet.methods.getMyCertificatesGroupByIssuer(
      {owner: true}
    );

    expect(Object.keys(certificatesGroupBy).length === numberOfBrands).to.be.true;
    const numberOfCertificatesFetched = Object.keys(certificatesGroupBy).reduce((acc, currKey) => {
      acc += certificatesGroupBy[currKey].length;

      return acc;
    }, 0);

    expect(numberOfCertificatesFetched === numberOfCertificates).to.be.true;

    certificatesGroupBy.return;
  });
