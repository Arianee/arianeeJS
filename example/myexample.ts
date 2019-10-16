import { CreateWalletWithPOAAndAria } from "../src/e2e/utils/create-wallet";
import { Arianee } from '../src'

const fetch = require("node-fetch-polyfill");

const createASimpleCertificate = async () => {
  const wallet = await CreateWalletWithPOAAndAria(
    "0xe7cfc290a5b9f5ad89978fa91eac0af0ca05eaa478c77735e13cf493cab40855"
  );

  const hash = wallet.web3.utils.keccak256(`ezofnzefon${Date.now()}`);
  const result = await wallet.methods.hydrateToken({
    uri: "http://localhost:3000/mycertificate.json",
    certificate: {
      $schema: "https://cert.arianee.org/version1/ArianeeAsset.json",
      name: "Arianee",
      v: "0.1",
      serialnumber: [{ type: "serialnumber", value: "SAMPLE" }],
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
      socialmedia: { instagram: "arianee_project", twitter: "ArianeeProject" },
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

  const { tokenId, passphrase, ...rest } = result;
  console.log(tokenId, passphrase);
  console.log("success")
};

const createAndTransfertCertificates = async () => {
  const [wallet1, nextOwnerWallet] = await Promise.all([
    CreateWalletWithPOAAndAria(
      "0xe7cfc290a5b9f5ad89978fa91eac0af0ca05eaa478c77735e13cf493cab40855"
    ),
    CreateWalletWithPOAAndAria(
      "0x1ad5d1387e5aad7b2a8185b9396366ddad0c158b848ed7b60f7226b5e4e5034e"
    )
  ]);

  await wallet1.storeContract.methods.buyCredit(0, 5, wallet1.publicKey).send();

  console.log("hydrate starting");
  const hash = wallet1.web3.utils.keccak256(`ezofnzefon${Date.now()}`);
  const result = await wallet1.methods.hydrateToken({
    uri: "https://api.myjson.com/bins/cf4ph",
    hash
  });

  const { tokenId, passphrase } = result;
  console.log(tokenId);
  console.log("hydrate ending");
  console.log(`https://arian.ee/${tokenId},${passphrase}`);

  await wallet1.smartAssetContract.methods
    .ownerOf(tokenId)
    .call();

  console.log("startint request token");
  await nextOwnerWallet.methods
    .requestToken(tokenId, passphrase)
    .then(i => console.log("successss requesting token"));

  const owner = await wallet1.smartAssetContract.methods
    .ownerOf(tokenId)
    .call();

  await nextOwnerWallet.
    methods.getCertificate(tokenId)
    .then(i => console.log(i.isOwner));

  console.log("FINISH!!");
};

const getAllCertificates = async () => {
  const wallet = await CreateWalletWithPOAAndAria(
    "0xe7cfc290a5b9f5ad89978fa91eac0af0ca05eaa478c77735e13cf493cab40855"
  );
  const result = await wallet.methods.getMyCertificates();
  console.log("result", result);
};

const getCertificate = async (tokenId, passphrase) => {
  const wallet = await CreateWalletWithPOAAndAria(
    "0xe7cfc290a5b9f5ad89978fa91eac0af0ca05eaa478c77735e13cf493cab40855"
  );
  const result = await wallet.methods.getCertificate(tokenId, passphrase);
  console.log("certificate", result);
  return;
};

const asynEvent = async (tokenId) => {
  const wallet = await CreateWalletWithPOAAndAria(
    "0xe7cfc290a5b9f5ad89978fa91eac0af0ca05eaa478c77735e13cf493cab40855"
  );

  /*
  
    const uri = await wallet.eventContract.methods.getEvent(tokenId).call()
  
    await wallet.storeContract.methods.buyCredit(2, 5, wallet.publicKey).send();
  
    const js = {
      $schema: "https://cert.arianee.org/version1/ArianeeEvent-i18n.json",
      title: "My first event",
      eventType: "service",
      description: "event description"
    };
  
    const schemaResult = await fetch(js.$schema).then(i => i.json());
  
    const imprint = await wallet.utils.cert(schemaResult, js);
    const eventId = Math.random();
    const i = await wallet.storeContract.methods
      .createEvent(
          eventId,
        9330,
        imprint,
        "",
        "0xE11BA2b4D45Eaed5996Cd0823791E0C93114882d"
      )
      .send();
  */

};


const getCertificateTransferEvents = async(tokenId)=>{
    const wallet = await CreateWalletWithPOAAndAria(
        "0xe7cfc290a5b9f5ad89978fa91eac0af0ca05eaa478c77735e13cf493cab40855"
    );
    const events = await wallet.methods.getCertificateTransferEvents(tokenId);
    //console.log("transferEvents", events);

};

const test=async()=>{
const n=new Arianee().connectToProtocol();
};

const readProof = async (tokenId) => {

  const wallet = await CreateWalletWithPOAAndAria(
    "0xe7cfc290a5b9f5ad89978fa91eac0af0ca05eaa478c77735e13cf493cab40855"
  );

  const proofLink = await wallet.methods.createCertificateProofLink(tokenId);

  const proofIsValid = await wallet.methods.isCertificateProofValid(tokenId, proofLink.passphrase);
  console.log(proofIsValid)
};


const getArianeeEvents = async(tokenId, passphrase)=>{
  const wallet = await CreateWalletWithPOAAndAria(
    "0xe7cfc290a5b9f5ad89978fa91eac0af0ca05eaa478c77735e13cf493cab40855"
  );
  const events = await wallet.methods.getCertificateTransferEvents(tokenId);
  console.log("transferEvents", events);

};


//getCertificateTransferEvents(722377);
//getCertificate(8186301, '9ilva4r6swwl');

