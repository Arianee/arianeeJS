import { ArianeeHttpClient } from '../../../libs/arianeeHttpClient/arianeeHttpClient';
import { SimpleStore } from '../../../libs/simpleStore/simpleStore';
import { BalanceService } from '../balanceService/balanceService';
import { BatchService } from '../batchService/batchService';
import { CertificateAuthorizationService } from '../certificateAuthorizationService/certificateAuthorizationService';
import { CertificateDetails } from '../certificateDetailsService/certificatesDetailsService';
import { CertificateUtilsService } from '../certificateUtilsService/certificateUtilsService';
import { ConfigurationService } from '../configurationService/configurationService';
import { ContractService } from '../contractService/contractsService';
import { EventService } from '../eventService/eventsService';
import { GlobalConfigurationService } from '../globalConfigurationService/globalConfigurationService';
import { UtilsService } from '../utilService/utilsService';
import { WalletService } from '../walletService/walletService';
import { Web3Service } from '../web3Service/web3Service';
import { DiagnosisService } from './diagnosisService';

describe('DigagnosisService ', () => {
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
    const balanceService:BalanceService = {} as BalanceService;
    const certificateUtilsService:CertificateUtilsService = {} as CertificateUtilsService;

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
      balanceService,
      certificateUtilsService
    };
  };
  test('should intitialize', () => {
    const dep = getAllDependencies();

    const certificateService = new DiagnosisService(
      dep.contractService,
      dep.configurationService,
      dep.balanceService,
      dep.walletService,
      dep.certificateUtilsService
    );

    expect(certificateService).toBeDefined();
  });
  test('it should return possible errors', async (done) => {
    const dep = getAllDependencies();

    const certificateService = new DiagnosisService(
      dep.contractService,
      dep.configurationService,
      dep.balanceService,
      dep.walletService,
      dep.certificateUtilsService
    );

    const result = await certificateService.diagnosis([
      Promise.resolve({
        isTrue: false,
        rawValue: true,
        message: 'this should appear',
        code: 'appear'
      }),
      Promise.resolve({
        isTrue: true,
        rawValue: true,
        message: 'this should not appear',
        code: 'not.appear'
      })
    ]);

    expect(result.find(i => i.code === 'appear')).toBeDefined();
    expect(result.find(i => i.code === 'not.appear')).toBeUndefined();

    done();
  });
  test('it should return unknow error if diagnosis did not found errors', async (done) => {
    const dep = getAllDependencies();

    const certificateService = new DiagnosisService(
      dep.contractService,
      dep.configurationService,
      dep.balanceService,
      dep.walletService,
      dep.certificateUtilsService
    );

    const result = await certificateService.diagnosis([
      Promise.resolve({
        isTrue: true,
        rawValue: true,
        message: 'this should appear',
        code: 'appear'
      }),
      Promise.resolve({
        isTrue: true,
        rawValue: true,
        message: 'this should not appear',
        code: 'not.appear'
      })
    ], 'unknown raw error');

    expect(result[0].rawValue).toBe('unknown raw error');
    expect(result.length === 1).toBeTruthy();

    done();
  });
});
