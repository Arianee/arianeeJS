import appendQuery from 'append-query';
import { injectable } from 'tsyringe';
import { CertificateJwt } from '../../../../models/JWT/certificate-jwt';
import { ContractService } from '../contractService/contractsService';
import { WalletService } from '../walletService/walletService';
import { JWTService } from './JWTService';
import { ArianeeBlockchainProxyService } from '../arianeeBlockchainProxyService/arianeeBlockchainProxyService';

@injectable()
export class ArianeeAccessTokenValidatorService {
  constructor (private jwtService: JWTService,
               private walletService: WalletService,
               private contractService: ContractService,
               private arianeeProxyService:ArianeeBlockchainProxyService
  ) {

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
    const certificateId = payload.subId;
    const owner = await this.arianeeProxyService.ownerOf(certificateId).catch(e => '');

    return this.jwtService.isValidJWT(token, owner);
  };
}
