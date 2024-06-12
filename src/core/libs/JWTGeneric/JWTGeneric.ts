import { Base64 } from 'js-base64';

export class JWTGeneric {
  private header = { typ: 'JWT', alg: 'ETH' };
  private payload;
  private encodedToken: string;

  constructor (private signer: (data) => {}, private decoder: any) {

  }

  /**
   * Set payload to be signed
   * @param payload
   */
  public setPayload = async (payload) => {
    this.payload = payload;

    return {
      sign: await this.sign.bind(this),
      setHeader: this.setHeader.bind(this)
    };
  };

  /**
   * Set payload to be signed
   * @param payload
   */
  public setHeader = async (payload) => {
    this.header = payload;
    return {
      sign: await this.sign.bind(this),
      setPayload: this.setPayload.bind(this)
    };
  };

  /**
   * Set token to be verified or decoded
   * @param encodedToken
   */
  public setToken (encodedToken) {
    this.encodedToken = encodedToken;
    return {
      decode: this.decode.bind(this),
      verify: this.verify.bind(this)
    };
  }

  private static base64Stringified (data): string {
    return Base64.encode(JSON.stringify(data));
  }

  private static fromBase64JSONParse (data: string) {
    return JSON.parse(Base64.fromBase64(data));
  }

  private async sign () {
    const header = JWTGeneric.base64Stringified(this.header);
    const payload = JWTGeneric.base64Stringified(this.payload);
    const signature = await this.signature();

    return `${header}.${payload}.${signature}`;
  }

  /**
   * Verify if signature was signed by pubKey and return true/false
   * @param pubKey
   */
  private verify (pubKey: string): boolean {
    const { header, signature, payload } = this.decode();
    const joinedHeaderPayload = JWTGeneric.base64Stringified(header) + '.' + JWTGeneric.base64Stringified(payload);
    const decode = this.decoder(joinedHeaderPayload, signature);

    const arePropertyValid = this.arePropertiesValid(payload);

    if (!arePropertyValid) {
      return false;
    }

    return pubKey.toLowerCase() === decode.toLowerCase();
  }

  public isExpValid = (timeBeforeExpInSec = 0): boolean => {
    if (timeBeforeExpInSec === -1) {
      return true;
    }
    const decoded = this.decode();
    const now = new Date().getTime();
    const isExpInMilliseconds = decoded.payload.exp.toString().length === 13;
    const expInMilliseconds = isExpInMilliseconds
      ? decoded.payload.exp
      : decoded.payload.exp * 1000;

    return now + timeBeforeExpInSec * 1000 < expInMilliseconds;
  };

  private arePropertiesValid = (payload) => {
    if (payload.exp) {
      const isExpired = !this.isExpValid(30);
      if (isExpired) {
        return false;
      }
    }
    if (payload.nbf) {
      const isBefore = new Date(payload.nbf).getTime() > Date.now();
      if (isBefore) {
        return false;
      }
    }

    return true;
  }

  private decode () {
    const [header, payload, signature] = this.encodedToken.split('.');
    return {
      header: JWTGeneric.fromBase64JSONParse(header),
      payload: JWTGeneric.fromBase64JSONParse(payload),
      signature: signature
    };
  }

  private signature () {
    return this.signer(JWTGeneric.base64Stringified(this.header) + '.' + JWTGeneric.base64Stringified(this.payload));
  }
}
