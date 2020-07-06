import appendQuery from 'append-query';
import { injectable } from 'tsyringe';
import { CertificateJwt } from '../../../../models/JWT/certificate-jwt';
import { ContractService } from '../contractService/contractsService';
import { WalletService } from '../walletService/walletService';
import { JWTService } from './JWTService';

@injectable()
export class ArianeeProofTokenService {
  constructor (private jwtService: JWTService, private walletService: WalletService, private contractService: ContractService) {

  }

  /**
   * Create a certificate JWTProof
   * @param certificateId
   */
  public createCertificateArianeeProofToken =(certificateId: number) => {
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
    public createActionArianeeProofTokenLink= (url:string, certificateId: number) => {
      const arianeeJWT = this.createCertificateArianeeProofToken(certificateId);

      return appendQuery(url, { arianeeJWT });
    }

  /**
   * Decode proof and return it
   * @param token
   */
  public decodeArianeeProofToken = (token) => {
    return this.jwtService.decode<CertificateJwt>(token);
  };

  /**
   * Method to check if token is valid and if certificateId is own by current wallet
   * @param token
   */
  public isCertificateArianeeProofTokenValid = async (token): Promise<boolean> => {
    const { payload } = this.jwtService.decode(token);
    const owner = await this.contractService.smartAssetContract.methods.ownerOf(payload.subId).call().catch(e => '');

    return this.jwtService.isValidJWT(token, owner);
  };
}
