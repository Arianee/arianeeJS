import { CertificateDetails } from './certificatesDetailsService';

import { UtilsService } from '../utilService/utilsService';
import { ArianeeHttpClient } from '../../../libs/arianeeHttpClient/arianeeHttpClient';
import { ConfigurationService } from '../configurationService/configurationService';
import { ContractService } from '../contractService/contractsService';
import { WalletService } from '../walletService/walletService';
import { EventService } from '../eventService/eventsService';
import { Web3Service } from '../web3Service/web3Service';
import { GlobalConfigurationService } from '../globalConfigurationService/globalConfigurationService';
import { IdentityService } from '../identityService/identityService';
import { SimpleStore } from '../../../libs/simpleStore/simpleStore';

describe('CertificateDetails', () => {
  const getAllDependencies = () => {
    const utils: UtilsService = {} as UtilsService;
    const simpleStore: SimpleStore = {} as SimpleStore;

    const identityService: IdentityService = {} as IdentityService;
    const httpClient: ArianeeHttpClient = {} as ArianeeHttpClient;
    const configurationService: ConfigurationService = {} as ConfigurationService;
    const contractService: ContractService = {} as ContractService;
    const globalConfigurationService = new GlobalConfigurationService();
    const walletService: WalletService = {} as WalletService;
    const eventService: EventService = {} as EventService;
    const web3Service: Web3Service = {} as Web3Service;

    return {
      utils,
      identityService,
      simpleStore,
      httpClient,
      configurationService,
      contractService,
      walletService,
      eventService,
      web3Service,
      globalConfigurationService
    };
  };

  test('should initialize', () => {
    const dep = getAllDependencies();

    const i = new CertificateDetails(
      dep.identityService,
      dep.httpClient,
      dep.contractService,
      dep.configurationService,
      dep.walletService,
      dep.utils,
      dep.simpleStore,
      dep.globalConfigurationService);
  });
});
