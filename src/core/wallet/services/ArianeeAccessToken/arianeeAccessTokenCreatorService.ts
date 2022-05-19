import appendQuery from 'append-query';
import { injectable } from 'tsyringe';
import { JWTService } from './JWTService';

@injectable()
export class ArianeeAccessTokenCreatorService {
  constructor (private jwtService: JWTService
  ) {

  }

  /**
   * Create a wallet JWTProof
   */
  public createWalletAccessToken = () => {
    return this.jwtService.sign({
      sub: 'wallet'
    });
  }

  /**
   * Create a certificate JWTProof
   * @param certificateId
   */
  public createCertificateArianeeAccessToken =(certificateId: number) => {
    return this.jwtService.sign({
      sub: 'certificate',
      subId: certificateId
    });
  }

  /**
   * Create JWTProof and add it to url
   * @param url
   * @param certificateId
   */
  public createActionArianeeAccessTokenLink= async (url:string, certificateId: number) => {
    const arianeeAccessToken = await this.createCertificateArianeeAccessToken(certificateId);

    return appendQuery(url, { arianeeAccessToken });
  }
}
