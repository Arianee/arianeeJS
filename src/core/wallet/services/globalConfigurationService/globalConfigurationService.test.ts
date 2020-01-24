import { ArianeeHttpClient } from '../../../libs/arianeeHttpClient/arianeeHttpClient';
import { SimpleStore } from '../../../libs/simpleStore/simpleStore';
import {
  ConsolidatedCertificateRequest,
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
        arianeeEvents: true
      };

      const i = new GlobalConfigurationService();
      i.setDefaultQuery(defaultQuery);
      const d = i.getMergedQuery({ issuer: { waitingIdentity: true } });
      const issuer:ConsolidatedIssuerRequestInterface = d.issuer as ConsolidatedIssuerRequestInterface;

      expect(issuer.forceRefresh).toBe(defaultQuery.issuer.forceRefresh);
      expect(issuer.waitingIdentity).toBe(true);

      expect(d.content).toBeFalsy();
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
        arianeeEvents: true
      };

      const i = new GlobalConfigurationService();
      i.setDefaultQuery(defaultQuery);
      const d = i.getMergedQuery({ issuer: true });
      const issuer:ConsolidatedIssuerRequestInterface = d.issuer as ConsolidatedIssuerRequestInterface;
      expect(issuer.forceRefresh).toBe(defaultQuery.issuer.forceRefresh);
      expect(issuer.waitingIdentity).toBe(defaultQuery.issuer.waitingIdentity);

      expect(d.content).toBeFalsy();
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
        arianeeEvents: true
      };

      const i = new GlobalConfigurationService();
      i.setDefaultQuery(defaultQuery);
      const d = i.getMergedQuery({ issuer: false });
      const issuer:ConsolidatedIssuerRequestInterface = d.issuer as ConsolidatedIssuerRequestInterface;

      expect(issuer).toBeFalsy();

      expect(d.content).toBeFalsy();
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
        arianeeEvents: true
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

  describe('random config', () => {
    test('default config is false and query is true', () => {
      const defaultQuery = {
        content: false
      };

      const i = new GlobalConfigurationService();
      i.setDefaultQuery(defaultQuery);
      const d = i.getMergedQuery({ content: true });

      expect(d.content).toBe(true);
    });
  });

  describe('Config language', () => {
    test('No language defined', () => {
      const defaultQuery:ConsolidatedCertificateRequest = {
        content: false,
        advanced: {
          languages: undefined
        }
      };

      const i = new GlobalConfigurationService();
      i.setDefaultQuery(defaultQuery);
      const d = i.getMergedQuery();

      expect(d.content).toBe(false);
      expect(d.advanced.languages).toBeUndefined();
    });
    test('No language defined in query but in defaultquery', () => {
      const defaultQuery:ConsolidatedCertificateRequest = {
        content: false,
        advanced: {
          languages: ['fr']
        }
      };

      const i = new GlobalConfigurationService();
      i.setDefaultQuery(defaultQuery);
      const d = i.getMergedQuery();

      expect(d.content).toBe(false);
      expect(d.advanced.languages).toEqual(defaultQuery.advanced.languages);
    });

    test('If no language defined in default query', () => {
      const defaultQuery:ConsolidatedCertificateRequest = {
        content: false,
        advanced: {
          languages: undefined
        }
      };

      const i = new GlobalConfigurationService();
      i.setDefaultQuery(defaultQuery);
      const d = i.getMergedQuery({ advanced: { languages: ['fr'] } });

      expect(d.content).toBe(false);
      expect(d.advanced.languages).toEqual(['fr']);
    });

    test('If no language defined at all', () => {
      const i = new GlobalConfigurationService();
      const d = i.getMergedQuery({ content: true });
      expect(d.content).toBe(true);
      expect(d.advanced).toBeDefined();
    });
    test('If language defined in default query', () => {
      const defaultQuery:ConsolidatedCertificateRequest = {
        content: false,
        advanced: {
          languages: ['fr']
        }
      };

      const i = new GlobalConfigurationService();
      i.setDefaultQuery(defaultQuery);
      const d = i.getMergedQuery({ advanced: { languages: ['es'] } });

      expect(d.content).toBe(false);
      expect(d.advanced.languages).toEqual(['es']);
    });
  });
});
