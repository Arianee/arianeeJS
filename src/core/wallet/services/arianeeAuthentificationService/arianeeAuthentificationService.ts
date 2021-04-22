import { injectable } from 'tsyringe';
import { ArianeeGateWayAuthentification } from '../../../../models/ArianeeGateWayAuthentification';
import { ArianeeTokenId } from '../../../../models/ArianeeTokenId';
import { JWTService } from '../ArianeeAccessToken/JWTService';
import { ConfigurationService } from '../configurationService/configurationService';
import { UtilsService } from '../utilService/utilsService';
import { WalletService } from '../walletService/walletService';

export interface ArianeeLinkObject {
    certificateId: ArianeeTokenId,
    authentification: string,
    type:'arianeeAccessToken' | 'passphrase'
}

@injectable()
export class ArianeeAuthentificationService {
  constructor (private jwtService: JWTService,
               private utils:UtilsService,
               private walletService:WalletService,
               private configurationService:ConfigurationService) {

  }

    public generateAuthentificationHeader = (certificateId:ArianeeTokenId, arianeeAuthenticator: string): Promise<ArianeeGateWayAuthentification> => {
      if (arianeeAuthenticator) {
        if (this.isArianeeAccessToken(arianeeAuthenticator)) {
          return Promise.resolve({
            bearer: arianeeAuthenticator,
            jwt: arianeeAuthenticator
          });
        } else {
          const temporaryWallet = this.configurationService.walletFactory()
            .fromPassPhrase(arianeeAuthenticator);

          return this.walletService.signProof(
            JSON.stringify({
              certificateId: certificateId,
              timestamp: new Date()
            }),
            temporaryWallet.privateKey
          );
        }
      } else {
        // sign with current wallet
        return this.walletService.signProof(
          JSON.stringify({
            certificateId: certificateId,
            timestamp: new Date()
          }),
          this.walletService.privateKey
        );
      }
    };

    public extractParametersFromArianeeLink = (arianeeLink: string):ArianeeLinkObject => {
      try {
        const decoded = this.jwtService.decode(arianeeLink);
        return {
          certificateId: decoded.payload.subId,
          authentification: arianeeLink,
          type: 'arianeeAccessToken'
        };
      } catch (e) {
        const result = this.utils.readLink(arianeeLink);
        if (result) {
          const { certificateId, passphrase, method } = result;
          return {
            certificateId,
            authentification: passphrase,
            type: 'passphrase'
          };
        } else {
          throw new Error('This is not an arianeeLink');
        }
      }
    };

    public isArianeeAccessToken = (arianeeLink: string):boolean => {
      try {
        // if it can be decoded an verify, it means it is a jwt
        this.jwtService.isValidJWT(arianeeLink, 'randomAddress');
        return true;
      } catch {
        return false;
      }
    };

    public isBlockchainPassphrase = (arianeeLink: string): boolean => {
      return !this.isArianeeAccessToken(arianeeLink);
    };
}
