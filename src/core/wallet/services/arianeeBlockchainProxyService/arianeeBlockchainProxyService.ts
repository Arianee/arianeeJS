import { injectable } from 'tsyringe';
import { ContractName, ContractService } from '../contractService/contractsService';
import { ArianeeHttpClient } from '../../../libs/arianeeHttpClient/arianeeHttpClient';
import { ConfigurationService } from '../configurationService/configurationService';
import { ArianeeTokenId } from '../../../../models';
import { WalletService } from '../walletService/walletService';
import { ArianeeAccessTokenCreatorService } from '../ArianeeAccessToken/arianeeAccessTokenCreatorService';
import { range } from 'lodash';
import { GetPastEventService } from '../getPastEventService/getPastEventService';
import { Web3Service } from '../web3Service/web3Service';

@injectable()
export class ArianeeBlockchainProxyService {
  constructor (private contractService: ContractService,
              private arianeeHttpClient: ArianeeHttpClient,
              private configurationService: ConfigurationService,
               private walletService:WalletService,
               private arianeeAccessTokenCreatorService:ArianeeAccessTokenCreatorService,
               private getPastEvent:GetPastEventService,
               private web3Service:Web3Service
  ) {
  }

  /**
   * Get uri of validated address
   * @param address
   */
  public getAddressURI=async (address:string) => {
    if (this.configurationService.isProxyEnable()) {
      const checkSumAddress = this.web3Service.web3.utils.toChecksumAddress(address);
      const events = await this.getPastEvent.getPastEvents(ContractName.identityContract,
        'URIValidate', {
          filter: { _identity: checkSumAddress }
        });

      if (events) {
        return events[0].returnValues._uri;
      }
    } else {
      return this.contractService.identityContract.methods
        .addressURI(address)
        .call();
    }
    throw new Error('No uri validated for this identity');
  }

  public getAllMyMessageIds=async ():Promise<any | number[]> => {
    if (this.configurationService.isProxyEnable()) {
      const messagesEvent = await this.getPastEvent.getPastEvents(ContractName.messageContract,
        'MessageSent',
        {
          fromBlock: 0,
          toBlock: 'latest',
          filter:
              {
                _receiver:
                this.walletService.address
              }
        });

      return messagesEvent.map(d => parseInt(d.returnValues._messageId, 10));
    } else {
      const nbMessages = await this.contractService.messageContract.methods.messageLengthByReceiver(this.walletService.address).call();

      const rangeOfMessage = range(0, +nbMessages);

      return Promise.all(rangeOfMessage
        .map(index => this.contractService.messageContract.methods.receiverToMessageIds(this.walletService.address, index)
          .call()));
    }
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
