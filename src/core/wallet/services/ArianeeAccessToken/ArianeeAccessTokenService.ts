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

  /**
   * Decode proof and return it
   * @param token
   */
  public decodeArianeeAccessToken = (token) => {
    return this.jwtService.decode<CertificateJwt>(token);
  };

  /**
   * Only check if iss of token signer of token
   * @param token
   */
  public isArianeeAccessTokenValid=async (token) => {
    const { payload } = this.jwtService.decode(token);

    return this.jwtService.isValidJWT(token, payload.iss);
  }

  /**
   * Get jwt in js object if token is valid
   * @param token
   */
  public getArianeeAccessTokenJWT=async (token) => {
    const isValid = await this.isArianeeAccessTokenValid(token);
    if (isValid) {
      return this.jwtService.decode(token);
    } else {
      throw new Error('arianee access token not vald');
    }
  }

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
