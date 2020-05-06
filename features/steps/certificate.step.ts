import { expect } from 'chai';
import axios from 'axios';
import { Given, Then, When } from 'cucumber';
import {
  CertificateSummary,
  ConsolidatedCertificateRequest,
  ConsolidatedIssuerRequest
} from '../../src/core/wallet/certificateSummary/certificateSummary';
import { waitFor } from './helpers/waitFor';
import { get } from 'lodash';

Given('user{int} has positive credit certificate balance', async function (
  userIndex
) {
  const wallet = this.store.getUserWallet(userIndex);
  const address = wallet.account.address;
  const balance = await wallet.contracts.creditHistoryContract.methods
    .balanceOf(wallet.address, 0)
    .send();

  expect(balance.toNumber() > 0).equals(true);
});

When('user{int} can make different request on certificate{int}', async function (userIndex, tokenIndex) {
  const wallet = this.store.getUserWallet(userIndex);
  const certificateId = this.store.getToken(tokenIndex);

  const verify = async (query:ConsolidatedCertificateRequest) => {
    const cer = await wallet.methods.getCertificate(certificateId, undefined, query);
    const keys = Object.keys(query);
    for (var i = 0; i < keys.length; i++) {
      const value = keys[i];
      expect(cer[value], `${value} does not exist on query ${JSON.stringify(query)}`).to.be.not.undefined;
    }
  };

  const queryToTest:Array<ConsolidatedCertificateRequest> = [
    { issuer: true },
    { content: true },
    { messageSenders: true },
    { owner: true },
    { isRequestable: true },
    // { arianeeEvents: true }
    // { events: true }
    {
      content: true,
      issuer: {
        waitingIdentity: true
      }
    },
    { issuer: true, content: true }

  ];

  await Promise.all(queryToTest.map(query => verify(query)));
});

Then(
  'user{int} certificates balance is {int}',
  async function (userIndex, expectedBalance) {
    const wallet = this.store.getUserWallet(userIndex);
    const balance = await wallet.contracts.smartAssetContract.methods.balanceOf(wallet.address).call() as any;

    expect(parseInt(balance)).equals(expectedBalance);
  }
);

When(
  'user{int} creates a new certificate{int} with uri {string}',
  { timeout: 45000 },
  async function (userIndex, tokenIndex, uri) {
    const wallet = this.store.getUserWallet(userIndex);
    const hash = wallet.web3.utils.keccak256('ezofnzefon');

    try {
      const { certificateId } = await wallet.methods.createCertificate({
        uri: uri,
        hash
      });

      await waitFor();

      this.store.storeToken(tokenIndex, certificateId);

      expect(true).equals(true);
    } catch (err) {
      console.error(err);
      console.error('ERROR');
      expect(true).equals(false);
    }
  }
);

When(
  'user{int} creates a new certificate{int} with expected errors',
  { timeout: 45000 },
  async function (userIndex, tokenIndex) {
    const wallet = this.store.getUserWallet(userIndex);
    const hash = wallet.web3.utils.keccak256('ezofnzefon');

    try {
      await wallet.methods.createCertificate({
        hash
      });
      expect(false).to.be.true;
    } catch (err) {
      const isCertificateCreditError:boolean = err.find(d => d.code === 'credit.certificate') !== undefined;
      const isApproveStoreError:boolean = err.find(d => d.code === 'approve.store') !== undefined;
      const isCreditPoaError:boolean = err.find(d => d.code === 'credit.POA') !== undefined;

      expect(isApproveStoreError).to.be.false;
      expect(isCertificateCreditError).to.be.true;
      expect(isCreditPoaError).to.be.false;
    }
  }
);

When(
  'user{int} createsAndStores certificate{int}',
  { timeout: 45000 },
  async function (userIndex, tokenIndex) {
    const wallet = this.store.getUserWallet(userIndex);

    try {
      const { certificateId } = await wallet.methods.createAndStoreCertificate({
        content: {
          $schema: 'https://cert.arianee.org/version1/ArianeeProductCertificate-i18n.json',
          name: 'Top Time Limited Edition'
        }
      }, `https://arianee.cleverapps.io/${process.env.NETWORK}/rpc`);

      this.store.storeToken(tokenIndex, certificateId);

      expect(true).equals(true);
    } catch (err) {
      console.error(err);
      console.error('ERROR');
      expect(true).equals(false);
    }
  }
);

When(
  'user{int} creates {int} new certificate in batch',
  async function (userIndex, certNb) {
    const wallet = this.store.getUserWallet(userIndex);
    const cert = [];
    for (let i = 0; i < certNb; i++) {
      cert.push({ uri: '', content: { $schema: 'https://cert.arianee.org/version1/ArianeeAsset.json', name: 'test batch' } });
    }
    try {
      await wallet.methods.createCertificatesBatch(cert);
      expect(true).equals(true);
    } catch (err) {
      console.error('ERROR', err);
      expect(true).equals(false);
    }
  }
);

When(
  'user{int} can call wallet method {string}',
  { timeout: 45000 },

  async function (userIndex, methodName, tableOfArg) {
    const wallet = this.store.getUserWallet(userIndex);

    const args = tableOfArg.rawTable
      .map(([key, value]) => {
        if (value.includes('certificate')) {
          const certificateIndex = value.split('certificate')[1];
          const certificateId = this.store.getToken(certificateIndex);
          return certificateId;
        } else {
          return value;
        }
      });

    const result = await wallet.methods[methodName](...args);

    this.store.storeCustom('result', result);
  }
);

When(
  'user{int} creates certificate{int} as:',
  { timeout: 45000 },

  async function (userIndex, tokenIndex, certificateContent) {
    const wallet = this.store.getUserWallet(userIndex);

    const content = JSON.parse(certificateContent);

    try {
      const result = await wallet.methods.createCertificate({
        content
      });

      const { certificateId } = result;
      this.store.storeToken(tokenIndex, certificateId);
      this.store.storeCustom('result', result);
    } catch (err) {
      console.error('ERROR');
      console.log(err);
      this.store.storeCustom('result', err);
    }
  }
);

When(
  'user{int} creates a new certificate{int} with uri {string} and passphrase {word}',
  { timeout: 45000 },

  async function (userIndex, tokenIndex, uri, password) {
    const wallet = this.store.getUserWallet(userIndex);

    const hash = wallet.web3.utils.keccak256('ezofnzefon');
    try {
      const { certificateId, passphrase, deepLink } = await wallet.methods.createCertificate({
        uri: uri,
        hash,
        passphrase: password
      });

      await waitFor();

      this.store.storeToken(tokenIndex, certificateId);

      expect(deepLink).to.be.not.undefined;
      expect(certificateId).to.be.not.undefined;
      expect(deepLink).to.be.not.undefined;

      expect(true).equals(true);
    } catch (err) {
      console.error('ERROR');
      console.log(err);
      expect(true).equals(false);
    }
  }
);

When(
  'user{int} create a proof in certificate{int} with passphrase {word}',
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
  'user{int} can check the proof in certificate{int} with passphrase {word}',
  async function (userIndex, certificateIndex, password) {
    const wallet = this.store.getUserWallet(userIndex);
    const certificateId = this.store.getToken(certificateIndex);

    const proofIsValid = await wallet.methods.isCertificateProofValid(certificateId, password);

    expect(proofIsValid.isTrue).equal(true);
  }
);

Then(
  'user{int} cannot check the proof in certificate{int} with passphrase {word}',
  async function (userIndex, certificateIndex, password) {
    const wallet = this.store.getUserWallet(userIndex);
    const certificateId = this.store.getToken(certificateIndex);

    const proofIsValid = await wallet.methods.isCertificateProofValid(certificateId, password);
    expect(proofIsValid.isTrue).equal(false);
  }
);

Then('user{int} is the owner of the certificate{int}', async function (
  userIndex,
  certificateIndex
) {
  const token = this.store.getToken(certificateIndex);
  const wallet = this.store.getUserWallet(userIndex);

  const owner = await wallet.contracts.smartAssetContract.methods.ownerOf(token).call();
  expect(wallet.address).equals(owner);
});

Then('user{int} destroys certificate{int}', async function (
  userIndex,
  certificateIndex
) {
  const token = this.store.getToken(certificateIndex);
  const wallet = this.store.getUserWallet(userIndex);

  await wallet.methods.destroyCertificate(token);
});

Then('user{int} recovers certificate{int}', async function (
  userIndex,
  certificateIndex
) {
  const token = this.store.getToken(certificateIndex);
  const wallet = this.store.getUserWallet(userIndex);

  await wallet.methods.recoverCertificate(token);
});

Then('user{int} is not the owner of the certificate{int}', async function (
  userIndex,
  certificateIndex
) {
  const token = this.store.getToken(certificateIndex);
  const wallet = this.store.getUserWallet(userIndex);

  const owner = await wallet.contracts.smartAssetContract.methods.ownerOf(token).call();
  expect(wallet.address !== owner).to.be.true;
});

Then(
  'user{int} is the owner of the certificate{int} with uri {string}',
  async function (userIndex, tokenIndex, expectedUri) {
    const token = this.store.getToken(tokenIndex);
    const wallet = this.store.getUserWallet(userIndex);

    const owner = await wallet.contracts.smartAssetContract.methods.ownerOf(token).call();

    expect(wallet.address).equals(owner);

    const uriKey = await wallet.contracts.smartAssetContract.methods
      .tokenURI(token)
      .call();

    expect(expectedUri).equals(uriKey);
  }
);

Given('user{int} requests certificate{int} with passprase {word}',
  async function (userIndex, tokenIndex, passphrase) {
    const wallet = this.store.getUserWallet(userIndex);
    const certificateId = this.store.getToken(tokenIndex);
    await wallet.methods.requestCertificateOwnership(certificateId, passphrase);
    await waitFor();
  }
);

Given('user{int} makes certificate{int} {word} without passphrase',
  async function (userIndex, tokenIndex, actionType) {
    const wallet = this.store.getUserWallet(userIndex);
    const certificateId = this.store.getToken(tokenIndex);

    const linkObject = await wallet.methods.createCertificateRequestOwnershipLink(certificateId);
    this.store.storeCustom('linkObject', linkObject);
  });

Given('user{int} requests certificate{int} with the link',
  async function (userIndex, tokenIndex) {
    const wallet = this.store.getUserWallet(userIndex);
    const certificateId = this.store.getToken(tokenIndex);

    const linkObject = this.store.getCustom('linkObject');

    await wallet.methods.requestCertificateOwnership(linkObject.certificateId, linkObject.passphrase);
  });

Given('user{int} checks if certificate{int} can be requested with passphrase {word}',
  async function (userIndex, tokenIndex, passphrase) {
    const wallet = this.store.getUserWallet(userIndex);
    const certificateId = this.store.getToken(tokenIndex);

    const isRequestable = await wallet.methods.isCertificateOwnershipRequestable(certificateId, passphrase);
    expect(isRequestable.isTrue).equal(true);
  });

Given('user{int} checks if certificate{int} can not be requested with passphrase {word}',
  async function (userIndex, tokenIndex, passphrase) {
    const wallet = this.store.getUserWallet(userIndex);
    const certificateId = this.store.getToken(tokenIndex);

    const isRequestable = await wallet.methods.isCertificateOwnershipRequestable(certificateId, passphrase);
    expect(isRequestable.isTrue).equal(false);
  });

Given('user{int} want to see certificate{int} details',
  async function (userIndex, tokenIndex) {
    const wallet = this.store.getUserWallet(userIndex);
    const certificateId = this.store.getToken(tokenIndex);

    const certficiateDetails = await wallet.methods.getCertificate(certificateId, undefined, { owner: true });
    expect(certficiateDetails).to.be.not.undefined;

    expect(certficiateDetails.owner).to.be.not.undefined;
  });

Given('user{int} sees certificate{int} details with passphrase {word} with params:',
  async function (userIndex, tokenIndex, passphrase, queryParameters) {
    const params = JSON.parse(queryParameters);
    const wallet = this.store.getUserWallet(userIndex);
    const certificateId = this.store.getToken(tokenIndex);

    const certficiateDetails = await wallet.methods.getCertificate(certificateId, passphrase, params);

    this.store.storeCustom('result', certficiateDetails);
  });

Then('result should have property',
  async function (table) {
    const properties = table.raw();
    const certficiateDetails = this.store.getCustom('result');
    properties.forEach(prop => {
      const [name, value] = prop;
      const hasProperty = get(certficiateDetails, name) !== undefined;
      expect(hasProperty.toString() === value.toString()).to.be.true;
    });
  });

Given('user{int} want to see certificate{int} details with passphrase {word}',
  async function (userIndex, tokenIndex, passphrase) {
    const wallet = this.store.getUserWallet(userIndex);
    const certificateId = this.store.getToken(tokenIndex);

    const certficiateDetails = await wallet.methods.getCertificate(certificateId, passphrase, { owner: true });
    expect(certficiateDetails).to.be.not.undefined;

    expect(certficiateDetails.owner).to.be.not.undefined;
  });

Given('user{int} want to see certificate{int} details from link with passphrase {word}',
  async function (userIndex, tokenIndex, passphrase) {
    const wallet = this.store.getUserWallet(userIndex);
    const certificateId = this.store.getToken(tokenIndex);

    const deepLink = wallet.utils.createLink(certificateId, passphrase);
    const certficiateDetails = await wallet.methods.getCertificateFromLink(deepLink.link, { owner: true });

    expect(certficiateDetails).to.be.not.undefined;
    expect(certficiateDetails.owner).to.be.not.undefined;
  });

Given('user{int} can see its {int} certificates from getMyCertificates',
  async function (userIndex, numberOfCertificates) {
    const wallet = this.store.getUserWallet(userIndex);

    const certificates = await wallet.methods.getMyCertificates(
      { owner: true }
    );

    expect(certificates.length === numberOfCertificates).to.be.true;
    certificates.forEach(certficiateDetails => {
      expect(certficiateDetails.owner).to.be.not.undefined;
    });
  });

Given('user{int} makes certificate{int} {word} with passphrase {word}',
  async function (userIndex, tokenIndex, actionType, passphrase) {
    const wallet = this.store.getUserWallet(userIndex);
    const certificateId = this.store.getToken(tokenIndex);

    return wallet.methods.createCertificateRequestOwnershipLink(certificateId, passphrase);
  });

Given('user{int} can see its {int} certificates and {int} issuers from groupByIssuerCertificates',
  async function (userIndex, numberOfCertificates, numberOfBrands) {
    const wallet = this.store.getUserWallet(userIndex);

    const certificatesGroupBy = await wallet.methods.getMyCertificatesGroupByIssuer(
      { owner: true }
    );

    expect(Object.keys(certificatesGroupBy).length === numberOfBrands).to.be.true;
    const numberOfCertificatesFetched = Object.keys(certificatesGroupBy).reduce((acc, currKey) => {
      acc += certificatesGroupBy[currKey].length;

      return acc;
    }, 0);

    expect(numberOfCertificatesFetched === numberOfCertificates).to.be.true;
  });

Given('user{int} switch certificate{int} issuer message authorization to {string}',
  async function (userIndex, tokenIndex, value) {
    const wallet = this.store.getUserWallet(userIndex);
    const certificateId = this.store.getToken(tokenIndex);

    const { issuer } = await wallet.methods.getCertificate(certificateId, undefined, { issuer: true });
    const { address } = issuer.identity;

    await wallet.methods.setMessageAuthorizationFor(certificateId, address, JSON.parse(value));
  });

Given('user{int} certificate{int} issuer message authorization should be {string}',
  async function (userIndex, tokenIndex, value) {
    const wallet = this.store.getUserWallet(userIndex);
    const certificateId = this.store.getToken(tokenIndex);

    const { issuer, messageSenders } = await wallet.methods
      .getCertificate(certificateId, undefined, { issuer: true, messageSenders: true });

    const { address } = issuer.identity;

    expect(messageSenders[address] === JSON.parse(value)).to.be.true;
  });

Given('user{int} want to see certificateId {string} with passphrase {string}',
  async function (userIndex, certificateId, passphrase, table) {
    const wallet = this.store.getUserWallet(userIndex);

    const tableToQuery = (queryTable) => {
      return queryTable.reduce((acc, curr) => {
        const propName = curr[0];
        const value = curr[1];

        acc[propName] = JSON.parse(value);

        return acc;
      }, {});
    };

    const query = tableToQuery(table.rawTable);
    const verify = async (certificate:CertificateSummary, query) => {
      const keys = Object.keys(query);
      for (var i = 0; i < keys.length; i++) {
        const value = keys[i];
        expect(certificate[value], `${value} does not exist on query ${JSON.stringify(query)}`).to.be.not.undefined;
      }
    };

    const certificate = await wallet.methods.getCertificate(certificateId, undefined, query);

    verify(certificate, query);

    this.store.storeCertificateSummary(certificateId, certificate);
  });

Then('certificateId {string} {string} imprint should be {string}',
  async function (certificateId, contentType, expectedImprint) {
    const summary = this.store.getCertificateSummary(certificateId);
    let contentToBeVerified;

    if (contentType === 'content') {
      contentToBeVerified = summary.content.imprint;
    } else if (contentType === 'identity') {
      contentToBeVerified = summary.issuer.identity.imprint;
    } else {
      throw new Error('this type of content is not defined');
    }

    expect(contentToBeVerified === expectedImprint).to.be.true;
  });
