import {Cert} from "@0xcert/cert";
import {singleton} from "tsyringe";
import { Sign } from "web3-core";
import {ConfigurationService} from "../configurationService/configurationService";
import {Web3Service} from "../web3Service/web3Service";

@singleton()
export class UtilsService {
  constructor (private web3Service: Web3Service, private configurationService: ConfigurationService) {
  }

  private get web3 () {
    return this.web3Service.web3;
  }

  public signProofForRequestToken (
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

  public signProofForRpc (certificateId: number, privateKey: string) {
    const message = {
      certificateId: certificateId,
      timestamp: Math.round(new Date().valueOf() / 1000)
    };

    return this.signProof(JSON.stringify(message), privateKey);
  }

  public simplifiedParsedURL (url: string) {
    const m = url.match(
      /^(([^:\/?#]+:)?(?:\/\/((?:([^\/?#:]*):([^\/?#:]*)@)?([^\/?#:]*)(?::([^\/?#:]*))?)))?([^?#]*)(\?[^#]*)?(#.*)?$/
      ),
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

  public createPassphrase () {
    return (
      Math.random()
        .toString(36)
        .substring(2, 8) +
      Math.random()
        .toString(36)
        .substring(2, 8)
    );
  }

  public signProof (data: string | Array<any>, privateKey: string):Sign {
    return this.web3.eth.accounts.sign(<string>data, privateKey);
  }

  public async cert (schema, data): Promise<string> {
    const cert = new Cert({
      schema: schema
    });

    const cleanData = this.cleanObject(data);

    const certif = await cert.imprint(cleanData);

    return "0x" + certif;
  }

  private cleanObject (obj: any) {
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

  public isRightChain (hostname: string) {
    if (hostname === this.configurationService.arianeeConfiguration.deepLink) {
      return true;
    } else {
      throw new Error("You are not in the right chain");
    }
  }

  public createLink (
    certificateId: number,
    passphrase: string,
    suffix?: string
  ): { certificateId: number; passphrase: string; link: string } {
    let link = `https://${this.configurationService.arianeeConfiguration.deepLink}`;

    if (suffix) {
      link = link + "/" + suffix;
    }

    link = link + `/${certificateId},${passphrase}`;

    return {
      certificateId: certificateId,
      passphrase: passphrase,
      link
    };
  }

  public readLink (link) {
    const url = this.simplifiedParsedURL(link);

    this.isRightChain(url.hostname);

    const methodUrl = url.pathname.split("/");

    const pathName = methodUrl[methodUrl.length - 1];

    const certificateId = parseInt(pathName.split(",")[0]);
    const passphrase = pathName.split(",")[1];

    let method = "requestOwnership";

    if (methodUrl.length > 2) method = methodUrl[1];

    return {
      method: method,
      certificateId: certificateId,
      passphrase
    };
  }

  public timestampIsMoreRecentThan (timestamp, seconds) {
    const date = new Date().valueOf();
    const minTime = date - seconds * 1000;

    return timestamp > minTime / 1000;
  }
}
