import { expect } from 'chai';
import { Given, Then } from 'cucumber';

Given('user{int} creates arianeeProofToken from certificate{int}',
  async function (userIndex, tokenIndex) {
    const wallet = this.store.getUserWallet(userIndex);
    const certificateId = this.store.getToken(tokenIndex);
    const certificateProof = await wallet.methods.createCertificateArianeeProofToken(certificateId);

    this.store.storeCustom('arianeeJWT', certificateProof);
  });

Given('user{int} get certificate with arianeeProofToken with parameters:',
  async function (userIndex, queryParameters) {
    const params = JSON.parse(queryParameters);
    const wallet = this.store.getUserWallet(userIndex);
    const arianeeJWT = this.store.getCustom('arianeeJWT');

    const issuerRPC = `https://arianee.cleverapps.io/${process.env.NETWORK}/rpc`;

    let result;
    try {
      result = await wallet.methods.getCertificateFromArianeeProofToken(arianeeJWT, {
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
  'user{int} check that arianeeProofToken{int} is valid',
  async function (userIndex, arianeeJwtIndex) {
    const wallet = this.store.getUserWallet(userIndex);
    const arianeejwt = this.store.getCustom(`arianeeJwtIndex_${arianeeJwtIndex}`);

    const isValid = await wallet.methods.isCertificateArianeeProofTokenValid(arianeejwt);
    expect(isValid).equals(true);
  }
);

Given(
  'user{int} create arianeeProofToken{int} on certficate{int}',
  function (userIndex, arianeeJwtIndex, tokenIndex) {
    const certificateId = this.store.getToken(tokenIndex);
    const wallet = this.store.getUserWallet(userIndex);

    const arianeejwt = wallet.methods.createCertificateArianeeProofToken(certificateId);

    this.store.storeCustom(`arianeeJwtIndex_${arianeeJwtIndex}`, arianeejwt);
  }
);
