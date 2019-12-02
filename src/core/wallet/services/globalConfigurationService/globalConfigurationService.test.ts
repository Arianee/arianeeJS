import { ArianeeHttpClient } from '../../../libs/arianeeHttpClient/arianeeHttpClient';
import { SimpleStore } from '../../../libs/simpleStore/simpleStore';
import {
  ConsolidatedIssuerRequest,
  ConsolidatedIssuerRequestInterface
} from '../../certificateSummary/certificateSummary';
import { CertificateDetails } from '../certificateDetailsService/certificatesDetailsService';
import { ConfigurationService } from '../configurationService/configurationService';
import { ContractService } from '../contractService/contractsService';
import { EventService } from '../eventService/eventsService';
import { IdentityService } from '../identityService/identityService';
import { UtilsService } from '../utilService/utilsService';
import { WalletService } from '../walletService/walletService';
import { Web3Service } from '../web3Service/web3Service';
import { GlobalConfigurationService } from './globalConfigurationService';

describe('GlobalConfigurationService', () => {
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

  describe('Identity request', () => {
    test('should merge value', () => {
      const dep = getAllDependencies();
      const defaultQuery = {
        isRequestable: true,
        content: true,
        issuer: {
          waitingIdentity: false,
          forceRefresh: false
        },
        owner: true,
        events: true,
        arianeeEvents: true,
        advanced: true
      };

      const i = new GlobalConfigurationService();
      i.setDefaultQuery(defaultQuery);
      const d = i.getMergedQuery({ issuer: { waitingIdentity: true } });
      const issuer:ConsolidatedIssuerRequestInterface = d.issuer as ConsolidatedIssuerRequestInterface;

      expect(issuer.forceRefresh).toBe(defaultQuery.issuer.forceRefresh);
      expect(issuer.waitingIdentity).toBe(true);

      expect(d.content).toBeUndefined();
    });

    test('should return default value', () => {
      const dep = getAllDependencies();
      const defaultQuery = {
        isRequestable: true,
        content: true,
        issuer: {
          waitingIdentity: false,
          forceRefresh: false
        },
        owner: true,
        events: true,
        arianeeEvents: true,
        advanced: true
      };

      const i = new GlobalConfigurationService();
      i.setDefaultQuery(defaultQuery);
      const d = i.getMergedQuery({ issuer: true });
      const issuer:ConsolidatedIssuerRequestInterface = d.issuer as ConsolidatedIssuerRequestInterface;
      expect(issuer.forceRefresh).toBe(defaultQuery.issuer.forceRefresh);
      expect(issuer.waitingIdentity).toBe(defaultQuery.issuer.waitingIdentity);

      expect(d.content).toBeUndefined();
    });

    test('should return nothing if false', () => {
      const dep = getAllDependencies();
      const defaultQuery = {
        isRequestable: true,
        content: true,
        issuer: {
          waitingIdentity: false,
          forceRefresh: false
        },
        owner: true,
        events: true,
        arianeeEvents: true,
        advanced: true
      };

      const i = new GlobalConfigurationService();
      i.setDefaultQuery(defaultQuery);
      const d = i.getMergedQuery({ issuer: false });
      const issuer:ConsolidatedIssuerRequestInterface = d.issuer as ConsolidatedIssuerRequestInterface;

      expect(issuer).toBeFalsy();

      expect(d.content).toBeUndefined();
    });
  });

  describe('combined request', () => {
    test('should merge value', () => {
      const dep = getAllDependencies();
      const defaultQuery = {
        isRequestable: true,
        content: true,
        issuer: {
          waitingIdentity: false,
          forceRefresh: false
        },
        owner: true,
        events: true,
        arianeeEvents: true,
        advanced: true
      };

      const i = new GlobalConfigurationService();
      i.setDefaultQuery(defaultQuery);
      const d = i.getMergedQuery({ issuer: { waitingIdentity: true }, content: true });
      const issuer: ConsolidatedIssuerRequestInterface = d.issuer as ConsolidatedIssuerRequestInterface;

      expect(issuer.forceRefresh).toBe(defaultQuery.issuer.forceRefresh);
      expect(issuer.waitingIdentity).toBe(true);

      expect(d.content).toBeTruthy();
    });
  });
});
