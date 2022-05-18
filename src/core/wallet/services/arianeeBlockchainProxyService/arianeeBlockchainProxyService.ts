import { injectable } from 'tsyringe';
import { ContractService } from '../contractService/contractsService';
import { ArianeeHttpClient } from '../../../libs/arianeeHttpClient/arianeeHttpClient';
import { ConfigurationService } from '../configurationService/configurationService';
import { ArianeeAccessTokenService } from '../ArianeeAccessToken/ArianeeAccessTokenService';
import { ArianeeTokenId } from '../../../../models';

@injectable()
export class ArianeeBlockchainProxyService {
  constructor (private contractService: ContractService,
              private arianeeAccessTokenService:ArianeeAccessTokenService,
              private arianeeHttpClient: ArianeeHttpClient,
              private configurationService: ConfigurationService) {
  }

  public getAllMyCertificateIds=async ():Promise<ArianeeTokenId[]> => {
    const authorization = await this.arianeeAccessTokenService.createWalletAccessToken();
    const headers = {
      authorization: `Bearer ${authorization}`
    };
    const chainId = this.configurationService.arianeeConfiguration.chainId;
    const url = `${this.configurationService.getBlockChainProxyEndpoint()}/nft/me/list?network=${this.configurationService.arianeeConfiguration.networkName}`;

    const data = await this.arianeeHttpClient.fetch(url, { headers });

    return data.map(d => d.tokenId);
  }
}
