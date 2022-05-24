import { injectable } from 'tsyringe';
import { ContractService } from '../contractService/contractsService';
import { ArianeeHttpClient } from '../../../libs/arianeeHttpClient/arianeeHttpClient';
import { ConfigurationService } from '../configurationService/configurationService';
import { ArianeeTokenId } from '../../../../models';
import { WalletService } from '../walletService/walletService';
import { ArianeeAccessTokenCreatorService } from '../ArianeeAccessToken/arianeeAccessTokenCreatorService';

@injectable()
export class ArianeeBlockchainProxyService {
  constructor (private contractService: ContractService,
              private arianeeHttpClient: ArianeeHttpClient,
              private configurationService: ConfigurationService,
               private walletService:WalletService,
               private arianeeAccessTokenCreatorService:ArianeeAccessTokenCreatorService
  ) {
  }

  /**
   * Return all tokenIds from proxy or blockchain depending on configuration
   */
  public getAllMyCertificateIds=async ():Promise<ArianeeTokenId[]> => {
    if (this.configurationService.isProxyEnable()) {
      const authorization = await this.arianeeAccessTokenCreatorService.createWalletAccessToken();
      const headers = {
        authorization: `Bearer ${authorization}`
      };
      const chainId = this.configurationService.arianeeConfiguration.chainId;
      const url = `${this.configurationService.getBlockChainProxyEndpoint()}/nft/me/list?network=${this.configurationService.arianeeConfiguration.networkName}`;

      const data = await this.arianeeHttpClient.fetch(url, { headers });

      return data.map(d => d.tokenId);
    } else {
      const numberOfCertificates = await this.contractService.smartAssetContract.methods
        .balanceOf(this.walletService.address)
        .call();

      const rangeOfIndex = [];

      for (let i = 0; i < <any>numberOfCertificates; i++) {
        rangeOfIndex.push(i);
      }

      // Fetch certificateIds of certificate with index
      return Promise.all(
        rangeOfIndex.map(index =>
          this.contractService.smartAssetContract.methods
            .tokenOfOwnerByIndex(this.walletService.address, index)
            .call()
        )
      );
    }
  }

  /**
   * Get owner of a token for current network from blockchain or proxy depending on configuration
   * If no owner (meaning nft is not minted) it throws
   * @param tokenId
   */
  public ownerOf=async (tokenId:string | number):Promise<any> => {
    if (this.configurationService.isProxyEnable()) {
      const network = this.configurationService.arianeeConfiguration.networkName;

      const url = `${this.configurationService.getBlockChainProxyEndpoint()}/nft/${network}/ownerOf/${tokenId}`;

      return this.arianeeHttpClient.fetch(url);
    } else {
      const address = await this.contractService
        .smartAssetContract
        .methods
        .ownerOf(tokenId)
        .call();
      return address.toLowerCase();
    }
  }
}
