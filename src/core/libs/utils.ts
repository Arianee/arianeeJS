import { Cert } from "@0xcert/cert";
import { schema88, Object88 } from "@0xcert/conventions";

export class Utils {
  constructor(private web3) {}
  
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

  public  signProof(data:string | Array<any>, privateKey: string) {
    return this.web3.eth.accounts.sign(data, privateKey);
  }

  public async cert(schema, data): Promise<string> {

    const cert = new Cert({
      schema: schema
    });

    const cleanData = this.cleanObject(data);

    const certif=await cert.imprint(cleanData);

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
}
