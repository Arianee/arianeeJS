import { injectable } from 'tsyringe';
import { ErrorCodeEnum } from '../../../../models/enum/ErrocCodeEnum';
import { ExtendedBoolean } from '../../../../models/extendedBoolean';
import { ArianeeHttpClient } from '../../../libs/arianeeHttpClient/arianeeHttpClient';
import { CertificateDetails } from '../certificateDetailsService/certificatesDetailsService';
import { ConfigurationService } from '../configurationService/configurationService';
import { ContractService } from '../contractService/contractsService';
import { UtilsService } from '../utilService/utilsService';
import { WalletService } from '../walletService/walletService';
import { ArianeeBlockchainProxyService } from '../arianeeBlockchainProxyService/arianeeBlockchainProxyService';

@injectable()
export class CertificateUtilsService {
  constructor (
        private utils: UtilsService,
        private httpClient: ArianeeHttpClient,
        private configurationService: ConfigurationService,
        private contractService: ContractService,
        private certificateDetails: CertificateDetails,
        private walletService: WalletService,
        private arianeeProxyService:ArianeeBlockchainProxyService
  ) {
  }

    public isCertificateIdFree = async (certificateId:number):Promise<boolean> => {
      try {
        await this.arianeeProxyService.ownerOf(certificateId.toString());
        return false;
      } catch {
        return true;
      }
    }

    public canCreateCertificateWithCertificateId = async (certificateId:number):Promise<boolean> => {
      try {
        const owner = await this.arianeeProxyService.ownerOf(certificateId);
        const imprint = await this.contractService.smartAssetContract.methods.tokenImprint(certificateId).call();
        const imprintIsEmpty = !imprint || imprint === '0x0000000000000000000000000000000000000000000000000000000000000000';
        const isOwner = owner.toLowerCase() === this.walletService.address.toLowerCase();

        return imprintIsEmpty && isOwner;
      } catch {
        return true;
      }
    }

    public customRequestTokenFactory = async (certificateId, passphrase) => {
      const temporaryWallet = this.configurationService
        .walletFactory()
        .fromPassPhrase(passphrase);

      const proof = await this.utils.signProofForRequestToken(
        certificateId,
        this.walletService.address,
        temporaryWallet.privateKey
      );

      return this.contractService.storeContract.methods.requestToken(
        certificateId,
        proof.messageHash,
        false,
        this.configurationService.arianeeConfiguration.brandDataHubReward.address,
        proof.signature
      );
    }

    public isCertificateOwnershipRequestable = async (
      certificateId,
      passphrase
    ): Promise<ExtendedBoolean> => {
      if (passphrase) {
        const temporaryWallet = this.configurationService
          .walletFactory()
          .fromPassPhrase(passphrase);

        const tokenHashedAccess = await temporaryWallet.contracts.smartAssetContract.methods.tokenHashedAccess(certificateId, 1).call().catch(e => false);
        const isRequestable = tokenHashedAccess === temporaryWallet.address;

        if (isRequestable) {
          return {
            isTrue: isRequestable,
            code: ErrorCodeEnum.isRequestable,
            message: 'certificate is requestable'
          };
        }
      }
      return {
        isTrue: false,
        code: ErrorCodeEnum.isRequestable,
        message: 'certificate is not requestable'
      };
    }
}
