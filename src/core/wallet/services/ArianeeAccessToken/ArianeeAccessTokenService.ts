import appendQuery from 'append-query';
import { injectable } from 'tsyringe';
import { CertificateJwt } from '../../../../models/JWT/certificate-jwt';
import { ContractService } from '../contractService/contractsService';
import { WalletService } from '../walletService/walletService';
import { JWTService } from './JWTService';

@injectable()
export class ArianeeAccessTokenService {
  constructor (private jwtService: JWTService, private walletService: WalletService, private contractService: ContractService) {

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

  /**
   * Decode proof and return it
   * @param token
   */
  public decodeArianeeAccessToken = (token) => {
    return this.jwtService.decode<CertificateJwt>(token);
  };

  /**
   * Method to check if token is valid and if certificateId is own by current wallet
   * @param token
   */
  public isCertificateArianeeAccessTokenValid = async (token): Promise<boolean> => {
    const { payload } = this.jwtService.decode(token);
    const owner = await this.contractService.smartAssetContract.methods.ownerOf(payload.subId).call().catch(e => '');

    return this.jwtService.isValidJWT(token, owner);
  };
}
