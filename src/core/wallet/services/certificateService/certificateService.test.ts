import { SimpleStore } from '../../../libs/simpleStore/simpleStore';
import { ArianeeAuthentificationService } from '../arianeeAuthentificationService/arianeeAuthentificationService';
import { CertificateAuthorizationService } from '../certificateAuthorizationService/certificateAuthorizationService';
import { CertificateUtilsService } from '../certificateUtilsService/certificateUtilsService';
import { DiagnosisService } from '../diagnosisService/diagnosisService';
import { CertificateService } from './certificateService';
import { UtilsService } from '../utilService/utilsService';
import { ArianeeHttpClient } from '../../../libs/arianeeHttpClient/arianeeHttpClient';
import { ConfigurationService } from '../configurationService/configurationService';
import { ContractService } from '../contractService/contractsService';
import { CertificateDetails } from '../certificateDetailsService/certificatesDetailsService';
import { WalletService } from '../walletService/walletService';
import { EventService } from '../eventService/eventsService';
import { Web3Service } from '../web3Service/web3Service';
import { GlobalConfigurationService } from '../globalConfigurationService/globalConfigurationService';
import { BatchService } from '../batchService/batchService';
import { ArianeeAccessTokenValidatorService } from '../ArianeeAccessToken/arianeeAccessTokenValidatorService';
import { ArianeeBlockchainProxyService } from '../arianeeBlockchainProxyService/arianeeBlockchainProxyService';

describe('CertificateService > ', () => {
  const getAllDependencies = () => {
    const utils: UtilsService = {} as UtilsService;
    const httpClient: ArianeeHttpClient = {} as ArianeeHttpClient;
    const configurationService: ConfigurationService = {} as ConfigurationService;
    const contractService: ContractService = {} as ContractService;
    const globalConfigurationService = new GlobalConfigurationService();
    const certificateDetails: CertificateDetails = {
      getCertificateOwner: jest.fn().mockResolvedValue(Promise.resolve('')),
      getCertificateIssuer: jest.fn().mockResolvedValue(Promise.resolve({ data: 'issuer' })),
      getCertificateContent: jest.fn().mockResolvedValue(Promise.resolve({ data: 'content', isAuthentic: true }))

    } as any;

    const certificateAuthorizationService: CertificateAuthorizationService = {} as CertificateAuthorizationService;

    const walletService: WalletService = {} as WalletService;
    const eventService: EventService = {} as EventService;
    const web3Service: Web3Service = {} as Web3Service;
    const simpleStore:SimpleStore = {} as SimpleStore;
    const batchService:BatchService = {} as BatchService;
    const diagnosisService:DiagnosisService = {} as DiagnosisService;
    const jwtProofService:ArianeeAccessTokenValidatorService = {} as ArianeeAccessTokenValidatorService;
    const certificateUtilsService:CertificateUtilsService = {} as CertificateUtilsService;
    const arianeeBlockchainProxyService:ArianeeBlockchainProxyService = {} as ArianeeBlockchainProxyService;

    const authentificateService:ArianeeAuthentificationService = {
      generateAuthentificationHeader: () => ({ bearer: 'ezfzef' })
    } as any;

    return {
      utils,
      httpClient,
      configurationService,
      contractService,
      certificateDetails,
      walletService,
      eventService,
      web3Service,
      globalConfigurationService,
      certificateAuthorizationService,
      simpleStore,
      batchService,
      diagnosisService,
      jwtProofService,
      certificateUtilsService,
      authentificateService,
      arianeeBlockchainProxyService
    };
  };
  test('should intitialize', () => {
    const dep = getAllDependencies();

    const certificateService = new CertificateService(
      dep.utils,
      dep.httpClient,
      dep.configurationService,
      dep.contractService,
      dep.certificateDetails,
      dep.walletService,
      dep.eventService,
      dep.web3Service,
      dep.certificateAuthorizationService,
      dep.globalConfigurationService,
      dep.simpleStore,
      dep.batchService,
      dep.diagnosisService,
      dep.jwtProofService,
      dep.certificateUtilsService,
      dep.authentificateService,
      dep.arianeeBlockchainProxyService
    );

    expect(certificateService).toBeDefined();
  });

  describe('getCertificate', () => {
    describe('global configuration', () => {
      test('should take into account global configuration', async () => {
        const dep = getAllDependencies();
        dep.globalConfigurationService.setDefaultQuery({ content: true, issuer: false });
        const certificateService = new CertificateService(
          dep.utils,
          dep.httpClient,
          dep.configurationService,
          dep.contractService,
          dep.certificateDetails,
          dep.walletService,
          dep.eventService,
          dep.web3Service,
          dep.certificateAuthorizationService,
          dep.globalConfigurationService,
          dep.simpleStore,
          dep.batchService,
          dep.diagnosisService,
          dep.jwtProofService,
          dep.certificateUtilsService,
          dep.authentificateService,
          dep.arianeeBlockchainProxyService

        );

        const result = await certificateService.getCertificate(2233);
        expect(result.certificateId).toBe(2233);

        expect(result.content).toBeDefined();
        expect(result.events).toBeUndefined();
        expect(result.isRequestable).toBeUndefined();
        expect(result.issuer).toBeUndefined();

        expect(dep.certificateDetails.getCertificateContent).toHaveBeenCalledTimes(1);
        expect(dep.certificateDetails.getCertificateIssuer).toHaveBeenCalledTimes(0);
      });
    });
    describe('request option', () => {
      describe('content request Option', () => {
        test('should NOT call getCertificateContent', async () => {
          const dep = getAllDependencies();

          const certificateService = new CertificateService(
            dep.utils,
            dep.httpClient,
            dep.configurationService,
            dep.contractService,
            dep.certificateDetails,
            dep.walletService,
            dep.eventService,
            dep.web3Service,
            dep.certificateAuthorizationService,
            dep.globalConfigurationService,
            dep.simpleStore,
            dep.batchService,
            dep.diagnosisService,
            dep.jwtProofService,
            dep.certificateUtilsService,
            dep.authentificateService,
            dep.arianeeBlockchainProxyService

          );

          const result = await certificateService.getCertificate(2233, undefined, { content: false });
          expect(dep.certificateDetails.getCertificateContent).toHaveBeenCalledTimes(0);
        });
        test('should call getCertificateContent', async () => {
          const dep = getAllDependencies();

          const certificateService = new CertificateService(
            dep.utils,
            dep.httpClient,
            dep.configurationService,
            dep.contractService,
            dep.certificateDetails,
            dep.walletService,
            dep.eventService,
            dep.web3Service,
            dep.certificateAuthorizationService,
            dep.globalConfigurationService,
            dep.simpleStore,
            dep.batchService,
            dep.diagnosisService,
            dep.jwtProofService,
            dep.certificateUtilsService,
            dep.authentificateService,
            dep.arianeeBlockchainProxyService

          );

          const result = await certificateService.getCertificate(2233, undefined, { content: true });

          expect(result.certificateId).toBe(2233);
          expect(result.content).toBeDefined();
          expect(result.events).toBeUndefined();
          expect(result.isRequestable).toBeUndefined();
          expect(result.issuer).toBeUndefined();

          expect(dep.certificateDetails.getCertificateContent).toHaveBeenCalled();
        });
      });

      describe('issuer request Option', () => {
        test('should call getCertificateIssuer (waitingIdentity)', async () => {
          const dep = getAllDependencies();

          const certificateService = new CertificateService(
            dep.utils,
            dep.httpClient,
            dep.configurationService,
            dep.contractService,
            dep.certificateDetails,
            dep.walletService,
            dep.eventService,
            dep.web3Service,
            dep.certificateAuthorizationService,
            dep.globalConfigurationService,
            dep.simpleStore,
            dep.batchService,
            dep.diagnosisService,
            dep.jwtProofService,
            dep.certificateUtilsService,
            dep.authentificateService,
            dep.arianeeBlockchainProxyService

          );

          await certificateService.getCertificate(2233, undefined, { issuer: { waitingIdentity: true } });
          expect(dep.certificateDetails.getCertificateIssuer).toHaveBeenCalled();
        });
        test('should call getCertificateIssuer', async () => {
          const dep = getAllDependencies();

          const certificateService = new CertificateService(
            dep.utils,
            dep.httpClient,
            dep.configurationService,
            dep.contractService,
            dep.certificateDetails,
            dep.walletService,
            dep.eventService,
            dep.web3Service,
            dep.certificateAuthorizationService,
            dep.globalConfigurationService,
            dep.simpleStore,
            dep.batchService,
            dep.diagnosisService,
            dep.jwtProofService,
            dep.certificateUtilsService,
            dep.authentificateService,
            dep.arianeeBlockchainProxyService

          );

          await certificateService.getCertificate(2233, undefined, { issuer: true });
          expect(dep.certificateDetails.getCertificateIssuer).toHaveBeenCalled();
        });
        test('should NOT call getCertificateIssuer', async () => {
          const dep = getAllDependencies();

          const certificateService = new CertificateService(
            dep.utils,
            dep.httpClient,
            dep.configurationService,
            dep.contractService,
            dep.certificateDetails,
            dep.walletService,
            dep.eventService,
            dep.web3Service,
            dep.certificateAuthorizationService,
            dep.globalConfigurationService,
            dep.simpleStore,
            dep.batchService,
            dep.diagnosisService,
            dep.jwtProofService,
            dep.certificateUtilsService,
            dep.authentificateService,
            dep.arianeeBlockchainProxyService

          );

          await certificateService.getCertificate(2233, undefined, { issuer: false });
          expect(dep.certificateDetails.getCertificateIssuer).toHaveBeenCalledTimes(0);
        });
      });
    });
  });

  describe('certificateOwnershipLink', () => {
    const createLinkMock = jest.fn();
    const certificateService = new CertificateService(
      { createLink: createLinkMock, createPassphrase: () => 'generatedPassphrase' } as any,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      {} as any,
      undefined,
        {} as any
    );

    beforeEach(() => {
      createLinkMock.mockReset();
    });

    const handleSpy = jest.spyOn(certificateService as any, 'setPassphrase');
    handleSpy.mockImplementation(() => {
      return Promise.resolve(true);
    });

    test('should create a ownership certificate', async () => {
      await certificateService.createCertificateRequestOwnershipLink(12345, 'testtest');
      expect(createLinkMock).toHaveBeenCalledWith(12345, 'testtest', undefined);
    });

    test('should create a ownership certificate with generated passphrase if not specified', async () => {
      await certificateService.createCertificateRequestOwnershipLink(12345);
      expect(createLinkMock).toHaveBeenCalledWith(12345, 'generatedPassphrase', undefined);
    });

    test('should create a ownership certificate if custom domain is specified', async () => {
      await certificateService.createCertificateRequestOwnershipLink(12345, undefined, 'nft.arianee.com');
      expect(createLinkMock).toHaveBeenCalledWith(12345, 'generatedPassphrase', 'nft.arianee.com');
    });
  });
});
