import {makeWalletReady} from "../features/steps/helpers/walletCreator";
import {NETWORK} from "../src";
import {Arianee} from "../src/core/arianee";

export const createASimpleCertificate = async () => {
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
