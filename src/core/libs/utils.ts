import { Cert } from "@0xcert/cert";
import { ServicesHub } from "../servicesHub";

export class Utils {
  constructor(private web3, private servicesHub: ServicesHub) { }

  public signProofForRequestToken(
    certificateId: number,
    publicKeyNextOwner: string,
    privateKeyPreviousOwner: string
  ) {
    const data = this.web3.utils.keccak256(
      this.web3.eth.abi.encodeParameters(
        ["uint", "address"],
        [certificateId, publicKeyNextOwner]
      )
    );

    return this.signProof(data, privateKeyPreviousOwner);
  }

  public signProofForRpc(
    certificateId:number,
    privateKey:string
  ) {
    const message = {certificateId:certificateId,timestamp: Math.round(new Date().valueOf()/1000)};

    return this.signProof( JSON.stringify(message), privateKey);
  }

  public simplifiedParsedURL(url: string) {
    const m = url.match(/^(([^:\/?#]+:)?(?:\/\/((?:([^\/?#:]*):([^\/?#:]*)@)?([^\/?#:]*)(?::([^\/?#:]*))?)))?([^?#]*)(\?[^#]*)?(#.*)?$/),
      r = {
        hash: m[10] || "",
        hostname: m[6] || "",
        pathname: m[8] || (m[1] ? "/" : ""),
        port: m[7] || "",
        protocol: m[2] || "",
        search: m[9] || "",
        username: m[4] || "",
        password: m[5] || ""
      };

    return m && r;
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
    for (let propName in obj) {
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

  public createLink(certificateId, passphrase): { certificateId: number, passphrase: string, link: string } {
    const link = `https://${this.servicesHub.arianeeConfig.deepLink}/${certificateId},${passphrase}`;

    return {
      certificateId: certificateId,
      passphrase: passphrase,
      link
    };
  }

  public readLink(link) {
    const url = this.simplifiedParsedURL(link);

    this.isRightChain(url.hostname);

    const pathName = url.pathname.substr(1);
    const certificateId = parseInt(pathName.split(",")[0]);
    const passphrase = pathName.split(",")[1];

    return {
      certificateId: certificateId,
      passphrase

    };
  }

  public timestampIsMoreRecentThan(timestamp, seconds){
    const date =  new Date().valueOf();
    const minTime = date-(seconds*1000);

    return (timestamp > (minTime/1000));
  }
}