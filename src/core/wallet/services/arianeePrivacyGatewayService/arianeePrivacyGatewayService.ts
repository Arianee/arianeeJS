import { injectable } from 'tsyringe';
import { ArianeeTokenId } from '../../../../models/ArianeeTokenId';
import { ConfigurationService } from '../configurationService/configurationService';
import { ContractService } from '../contractService/contractsService';
import { IdentityService } from '../identityService/identityService';
import { get } from 'lodash';

@injectable()
export class ArianeePrivacyGatewayService {
  constructor (private configurationService: ConfigurationService,
                private contractService: ContractService,
                private identityService: IdentityService
  ) {

  }

    /**
     * Return Arianee Privacygateway or fallbacks
     * @param {string} url
     * @param {ArianeeTokenId} certificateId
     * @returns {Promise<string | any>}
     */
    public getArianeePrivacyURLORFallback = async (url?: string, certificateId?: ArianeeTokenId) => {
      if (url) {
        return url;
      } else if (this.configurationService.arianeeConfiguration.defaultArianeePrivacyGateway) {
        // try if user specified a defaultArianeePrivacyGateway
        return this.configurationService.arianeeConfiguration.defaultArianeePrivacyGateway;
      } else if (certificateId) { // try if rpc of issuer of certificate
        const certificateIssuerAddress = await this.contractService.smartAssetContract.methods.issuerOf(certificateId).call();
        const issuerIdentity = await this.identityService.getIdentity({
          address: certificateIssuerAddress,
          query: { issuer: true }
        });
        const rcpFromIdentity = get(issuerIdentity, 'data.rpcEndpoint');
        if (rcpFromIdentity) {
          return rcpFromIdentity;
        }
      }
      throw new Error('You need to specify an Arianee Privacy Gateway URL');
    };
}
