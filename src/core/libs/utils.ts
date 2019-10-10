import { Cert } from "@0xcert/cert";
import { ServicesHub } from "../servicesHub";

export class Utils {
  constructor(private web3, private servicesHub: ServicesHub) { }

  public signProofForRequestToken(
    tokenId: number,
    publicKeyNextOwner: string,
    privateKeyPreviousOwner: string
  ) {
    const data = this.web3.utils.keccak256(
      this.web3.eth.abi.encodeParameters(
        ["uint", "address"],
        [tokenId, publicKeyNextOwner]
      )
    );

    return this.signProof(data, privateKeyPreviousOwner);
  }

  public createPassphrase() {
    return (
      Math.random()
        .toString(36)
        .substring(2, 8) +
      Math.random()
        .toString(36)
        .substring(2, 8)
    );
  }

  public signProof(data: string | Array<any>, privateKey: string) {
    return this.web3.eth.accounts.sign(data, privateKey);
  }

  public async cert(schema, data): Promise<string> {

    const cert = new Cert({
      schema: schema
    });

    const cleanData = this.cleanObject(data);

    const certif = await cert.imprint(cleanData);

    return "0x" + certif;
  }

  private cleanObject(obj: any) {
    for (var propName in obj) {
      if (
        obj[propName] &&
        obj[propName].constructor === Array &&
        obj[propName].length === 0
      ) {
        delete obj[propName];
      }
    }

    return obj;
  }

  public isRightChain(hostname: string) {
    if (hostname === this.servicesHub.arianeeConfig.deepLink) {
      return true;
    } else {
      throw new Error('You are not in the right chain');
    }
  }

  public createLink(tokenId, passphrase): { tokenId: number, passphrase: string, link: string } {
    const link = `https://${this.servicesHub.arianeeConfig.deepLink}/${tokenId},${passphrase}`;

    return {
      tokenId: tokenId,
      passphrase: passphrase,
      link
    };
  }

  public readLink(link) {
    const url = new URL(link);

    this.isRightChain(url.hostname);

    const pathName=url.pathname.substr(1);
    const tokenId = parseInt(pathName.split(",")[0]);
    const passphrase = pathName.split(",")[1];

    return {
      tokenId,
      passphrase

    };
  }

  public sortEvents(obj1, obj2){
      if (obj1.blockNumber > obj2.blockNumber) {
          return 1;
      }

      if (obj1.blockNumber < obj2.blockNumber) {
          return -1;
      }

      return 0;
  }
}