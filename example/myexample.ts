import {makeWalletReady} from "../features/steps/helpers/walletCreator";
import {Arianee, NETWORK} from '../src';
import {CreateWalletWithPOAAndAria} from "../src/e2e/utils/create-wallet";

var fetch = require("node-fetch-polyfill");

const createASimpleCertificate = async () => {
  const arianee = await new Arianee().init(NETWORK.arianeeTestnet);
  const wallet = arianee.fromRandomKey();
  await makeWalletReady(wallet);

  await wallet.storeContract.methods.buyCredit(0, 5, wallet.publicKey).send();

  const result = await wallet.methods.createCertificate({
    uri: "http://localhost:3000/mycertificate.json",
    content: {
      $schema: "https://cert.arianee.org/version1/ArianeeAsset.json",
      name: "Arianee",
      v: "0.1",
      serialnumber: [{type: "serialnumber", value: "SAMPLE"}],
      brand: "Arianee",
      model: "Token goody",
      description:
        "Here is the digital passport of your Arianee token goody, giving you a glimpse of an augmented ownership experience. This Smart-Asset has a unique ID. It is transferable and enables future groundbreaking features. \n Connect with the arianee team to learn more.",
      type: "SmartAsset",
      picture:
        "https://www.arianee.org/wp-content/uploads/2019/02/Screen-Shot-2019-02-27-at-12.12.53-PM.png",
      pictures: [
        {
          src:
            "https://www.arianee.org/wp-content/uploads/2019/02/Screen-Shot-2019-02-27-at-12.14.36-PM.png"
        }
      ],
      socialmedia: {instagram: "arianee_project", twitter: "ArianeeProject"},
      externalContents: [
        {
          title: "About Arianee",
          url: "https://www.arianee.org",
          backgroundColor: "#000",
          color: "#FFF"
        }
      ],
      jsonSurcharger: "url"
    }
  });

  const {certificateId, passphrase, ...rest} = result;
  console.log(certificateId, passphrase);
  console.log("success");
};

const createAndTransfertCertificates = async () => {

  const arianee = await new Arianee().init(NETWORK.arianeeTestnet);
  const wallet1 = arianee.fromRandomKey();
  await makeWalletReady(wallet1);

  const nextOwnerWallet = arianee.fromRandomKey();

  await makeWalletReady(nextOwnerWallet);

  await wallet1.storeContract.methods.buyCredit(0, 5, wallet1.publicKey).send();

  console.log("hydrate starting");
  const hash = wallet1.web3.utils.keccak256(`ezofnzefon${Date.now()}`);
  const result = await wallet1.methods.createCertificate({
    uri: "https://api.myjson.com/bins/cf4ph",
    hash
  });

  const {certificateId, passphrase} = result;
  console.log(certificateId, passphrase);
  console.log("hydrate ending");
  console.log(`https://arian.ee/${certificateId},${passphrase}`);

  await wallet1.smartAssetContract.methods
    .ownerOf(certificateId)
    .call();

  console.log("startint request token");
  await nextOwnerWallet.methods
    .requestCertificateOwnership(certificateId, passphrase)
    .then(i => console.log("successss requesting token"));

  const owner = await wallet1.smartAssetContract.methods
    .ownerOf(certificateId)
    .call();

  await nextOwnerWallet.methods.getCertificate(certificateId)
    .then(i => console.log(i.owner.isOwner));

  console.log("FINISH!!");
};

const getAllCertificates = async () => {
  const wallet = await CreateWalletWithPOAAndAria(
    "0xe7cfc290a5b9f5ad89978fa91eac0af0ca05eaa478c77735e13cf493cab40855"
  );
  const result = await wallet.methods.getMyCertificates();
  console.log("result", result);
};

const getCertificate = async (certificateId, passphrase) => {
  const wallet = await CreateWalletWithPOAAndAria(
    "0xe7cfc290a5b9f5ad89978fa91eac0af0ca05eaa478c77735e13cf493cab40855"
  );
  const result = await wallet.methods.getCertificate(certificateId, passphrase);
  console.log("certificate", result);
  return;
};

const testsg = async () => {

  const arianee = new Arianee();
  const ari1 = await arianee.init(NETWORK.arianeeTestnet);
  const ari2 = await arianee.init(NETWORK.arianeeTestnet);

  const ari1Wallet = ari1.fromRandomKey();
  await makeWalletReady(ari1Wallet);

  ari2.fromRandomKey();

  await ari1Wallet.storeContract.methods.buyCredit(0, 5, ari1Wallet.publicKey).send();

};

const asynEvent = async (certificateId) => {
  const wallet = await CreateWalletWithPOAAndAria(
    "0xe7cfc290a5b9f5ad89978fa91eac0af0ca05eaa478c77735e13cf493cab40855"
  );

};

const getCertificateTransferEvents = async (certificateId) => {
  const wallet = await CreateWalletWithPOAAndAria(
    "0xe7cfc290a5b9f5ad89978fa91eac0af0ca05eaa478c77735e13cf493cab40855"
  );
  const events = await wallet.methods.getCertificateTransferEvents(certificateId);
  //console.log("transferEvents", events);

};

const test = async () => {
  const wallet = await CreateWalletWithPOAAndAria(
    "0xe7cfc290a5b9f5ad89978fa91eac0af0ca05eaa478c77735e13cf493cab40855"
  );
  try {

    const certificate = await wallet.methods.getCertificate(72520, undefined, {
      isRequestable: false,
      content: false,
      issuer: false,
      owner: false,
      events: false,
      advanced: false,
    });
    console.log('certificate', certificate);
  } catch (err) {
    //console.log(err)
  }
};
const getAllMyCertificates = async () => {
  const wallet = await CreateWalletWithPOAAndAria(
    "0xe7cfc290a5b9f5ad89978fa91eac0af0ca05eaa478c77735e13cf493cab40855"
  );

  try {
    console.log('fetching certificate');
    const certificate = await wallet.methods.getMyCertificates({
      isRequestable: false,
      content: false,
      issuer: true,
      owner: false,
      events: false,
      advanced: false,
    });
    console.log('certificate', certificate);
  } catch (err) {
    console.log('errror', err);
    //console.log(err)
  }
};
const getAllMyCertificatesGroupBy = async () => {
  const wallet = await CreateWalletWithPOAAndAria(
    "0xe7cfc290a5b9f5ad89978fa91eac0af0ca05eaa478c77735e13cf493cab40855"
  );

  try {
    const certificate = await wallet.methods.getMyCertificatesGroupByIssuer({
      isRequestable: false,
      content: false,
      issuer: true,
      owner: false,
      events: false,
      advanced: false,
    });
    console.log('certificate', certificate);
  } catch (err) {
    console.log('errror', err);
    //console.log(err)
  }
};

const readProof = async (certificateId) => {

  const wallet = await CreateWalletWithPOAAndAria(
    "0xe7cfc290a5b9f5ad89978fa91eac0af0ca05eaa478c77735e13cf493cab40855"
  );

  const proofLink = await wallet.methods.createCertificateProofLink(certificateId);

  const proofIsValid = await wallet.methods.isCertificateProofValid(certificateId, proofLink.passphrase);
  console.log(proofIsValid);
};

const getArianeeEvents = async (certificateId, passphrase) => {
  const wallet = await CreateWalletWithPOAAndAria(
    "0xe7cfc290a5b9f5ad89978fa91eac0af0ca05eaa478c77735e13cf493cab40855"
  );
  const events = await wallet.methods.getCertificateTransferEvents(certificateId);
  console.log("transferEvents", events);

};

//getCertificateTransferEvents(722377);
//getCertificate(8186301, '9ilva4r6swwl');
