import {Given, Then} from '@cucumber/cucumber';
import {expect} from 'chai';

Given('user{int} creates Arianee Access Token from certificate{int}',
  async function (userIndex, tokenIndex) {
    const wallet = this.store.getUserWallet(userIndex);
    const certificateId = this.store.getToken(tokenIndex);
    const certificateProof = await wallet.methods.createCertificateArianeeAccessToken(certificateId);

    this.store.storeCustom('arianeeJWT', certificateProof);
  });

Given('user{int} get certificate with Arianee Access Token with parameters:',
  async function (userIndex, queryParameters) {
    const params = JSON.parse(queryParameters);
    const wallet = this.store.getUserWallet(userIndex);
    const arianeeJWT = this.store.getCustom('arianeeJWT');

    const issuerRPC = `http://localhost:3002/${process.env.NETWORK}/rpc`;

    let result;
    try {
      result = await wallet.methods.getCertificateFromArianeeAccessToken(arianeeJWT, {
        issuer: {
          rpcURI: issuerRPC
        },
        ...params
      }
      );
    } catch (e) {
      result = e;
      console.error(e);
    }
    this.store.storeCustom('result', result);
  });

Then(
  'user{int} check that Arianee Access Token{int} is valid',
  async function (userIndex, arianeeJwtIndex) {
    const wallet = this.store.getUserWallet(userIndex);
    const arianeejwt = this.store.getCustom(`arianeeJwtIndex_${arianeeJwtIndex}`);

    const isValid = await wallet.methods.isCertificateArianeeAccessTokenValid(arianeejwt);
    expect(isValid).equals(true);
  }
);

Given(
  'user{int} create Arianee Access Token{int} on certficate{int}',
  async function (userIndex, arianeeJwtIndex, tokenIndex) {
    const certificateId = this.store.getToken(tokenIndex);
    const wallet = this.store.getUserWallet(userIndex);

    const arianeejwt = await wallet.methods.createCertificateArianeeAccessToken(certificateId);

    this.store.storeCustom(`arianeeJwtIndex_${arianeeJwtIndex}`, arianeejwt);
  }
);
