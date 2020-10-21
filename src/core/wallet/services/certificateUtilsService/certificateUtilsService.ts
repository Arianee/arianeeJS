import { injectable } from 'tsyringe';
import { ExtendedBoolean } from '../../../../models/extendedBoolean';
import { ArianeeHttpClient } from '../../../libs/arianeeHttpClient/arianeeHttpClient';
import { CertificateDetails } from '../certificateDetailsService/certificatesDetailsService';
import { ConfigurationService } from '../configurationService/configurationService';
import { ContractService } from '../contractService/contractsService';
import { UtilsService } from '../utilService/utilsService';
import { WalletService } from '../walletService/walletService';

@injectable()
export class CertificateUtilsService {
  constructor (
        private utils: UtilsService,
        private httpClient: ArianeeHttpClient,
        private configurationService: ConfigurationService,
        private contractService: ContractService,
        private certificateDetails: CertificateDetails,
        private walletService: WalletService) {
  }

    public isCertificateIdFree = async (certificateId:number):Promise<boolean> => {
      try {
        await this.contractService.smartAssetContract.methods.ownerOf(certificateId).call();
        return false;
      } catch {
        return true;
      }
    }

    public canCreateCertificateWithCertificateId = async (certificateId:number):Promise<boolean> => {
      try {
        const owner = await this.contractService.smartAssetContract.methods.ownerOf(certificateId).call();
        const imprint = await this.contractService.smartAssetContract.methods.tokenImprint(certificateId).call();
        const imprintIsEmpty = !imprint || imprint === '0x0000000000000000000000000000000000000000000000000000000000000000';
        const isOwner = owner === this.walletService.address;

        return imprintIsEmpty && isOwner;
      } catch {
        return true;
      }
    }

    public customRequestTokenFactory = (certificateId, passphrase) => {
      const temporaryWallet = this.configurationService
        .walletFactory()
        .fromPassPhrase(passphrase);

      const proof = this.utils.signProofForRequestToken(
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
      try {
        await this.customRequestTokenFactory(certificateId, passphrase).call();

        return {
          isTrue: true,
          code: 'certicate.requestable',
          message: 'certificate is requestable'
        };
      } catch (err) {
        return {
          isTrue: false,
          code: 'certicate.notrequestable',
          message: 'certificate is not requestable'
        };
      }
    }
}
