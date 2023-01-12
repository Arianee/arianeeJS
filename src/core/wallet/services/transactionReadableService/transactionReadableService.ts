import { injectable } from 'tsyringe';
import { ContractService } from '../contractService/contractsService';
import { ConfigurationService } from '../configurationService/configurationService';
import { GlobalConfigurationService } from '../globalConfigurationService/globalConfigurationService';

@injectable()
export class TransactionReadableService {
  constructor (private configurationService: ConfigurationService) {
  }

  public getReadableTransaction ({ data, transaction }) {
    const { constant, inputs, name, outputs, payable, stateMutability, type, signature } = data._method;

    const readableArguments = data.arguments
      .map((value, index) => {
        return {
          value,
          name: inputs[index].name
        };
      });

    const { from, to } = transaction;
    const contractName = this.configurationService.getContractNameFromAddress(to);

    const readableTransaction = {
      contractName,
      from,
      to,
      constant,
      inputs,
      name,
      outputs,
      payable,
      stateMutability,
      type,
      signature,
      arguments: readableArguments
    };

    return readableTransaction;
  };
}
