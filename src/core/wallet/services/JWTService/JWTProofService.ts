import appendQuery from 'append-query';
import { injectable } from 'tsyringe';
import { ContractService } from '../contractService/contractsService';
import { WalletService } from '../walletService/walletService';
import { JWTService } from './JWTService';

@injectable()
export class JWTProofService {
  constructor (private jwtService: JWTService, private walletService: WalletService, private contractService: ContractService) {

  }

  /**
   * Create a certificate JWTProof
   * @param certificateId
   */
  public createCertificateJWTProof =(certificateId: number) => {
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
    public createActionJWTProofLink= (url:string, certificateId: number) => {
      const token = this.createCertificateJWTProof(certificateId);

      return appendQuery(url, { token });
    }

  /**
   * Decode proof and return it
   * @param token
   */
  public decodeJWTProof = (token) => {
    return this.jwtService.decode(token);
  };

  /**
   * Method to check if token is valid and if certificateId is own by current wallet
   * @param token
   */
  public isCertificateJWTProofValid = async (token): Promise<boolean> => {
    const { certificateId } = this.jwtService.decode(token);
    const owner = await this.contractService.smartAssetContract.methods.ownerOf(certificateId).call().catch(e => '');

    return this.jwtService.isValidJWT(token, owner);
  };
}
