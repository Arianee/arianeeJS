import { injectable } from 'tsyringe';
import { ContractName, ContractService } from '../contractService/contractsService';
import { ConfigurationService } from '../configurationService/configurationService';
import { BlockchainEvent } from '../../../../models';
import { ArianeeHttpClient } from '../../../libs/arianeeHttpClient/arianeeHttpClient';
import appendQuery from 'append-query';
import { Contract } from 'web3-eth-contract';
import { Web3Service } from '../web3Service/web3Service';

@injectable()
export class GetPastEventService {
  constructor (private contractService: ContractService,
               private arianeeHttpClient: ArianeeHttpClient,
               private configurationService: ConfigurationService,
               private web3Service:Web3Service
  ) {
  }

  public urlFactory = (contractAddress: string, eventName: string, parameters: {
    filter?: any,
    fromBlock?: number,
    toBlock?: number | 'latest'
  } = {}) => {
    if (!this.web3Service.web3.utils.isAddress(contractAddress)) {
      throw new Error('contractAddress must be a valid address');
    }

    const { toBlock, fromBlock } = parameters;
    const endpoint = this.configurationService.getBlockChainProxyEndpoint();
    const chainId = this.configurationService.arianeeConfiguration.chainId;

    const filter = parameters.filter || [];

    const returnValues = Object.keys(filter).reduce((acc, curr, index) => {
      acc[`returnValues.${curr}`] = filter[curr];
      return acc;
    }, {});
    const url = `${endpoint}/${chainId}/contract/${contractAddress}/${eventName}`;
    const finalUrl = appendQuery(url, {
      ...returnValues,
      toBlock,
      fromBlock
    });

    return finalUrl;
  }

  public getPastEvents = async (contractAddressOrContractName: string | ContractName, eventName: string, parameters?: {
    filter?: any,
    fromBlock?: number,
    toBlock?: number | 'latest'
  }): Promise<BlockchainEvent[]> => {
    const contractInstance:Contract = this.contractService.getContractInstanceFromAddressOrContractName(contractAddressOrContractName);
    if (!contractInstance) {
      throw new Error(`this contract does not exist ${contractAddressOrContractName}`);
    }
    const address = contractInstance.options.address;
    if (this.configurationService.isProxyEnable()) {
      const url = this.urlFactory(address, eventName, parameters);
      const result = await this.arianeeHttpClient.fetch(url);
      return result;
    } else {
      return contractInstance
        .getPastEvents(eventName, parameters);
    }
  }
}
