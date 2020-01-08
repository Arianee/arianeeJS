import { injectable } from 'tsyringe';
import { IdentitySummary } from '../../../../models/arianee-identity';
import { CertificateId } from '../../../../models/CertificateId';
import { ArianeeHttpClient } from '../../../libs/arianeeHttpClient/arianeeHttpClient';
import {
  ConsolidatedCertificateRequest,
  ConsolidatedIssuerRequest,
  ConsolidatedIssuerRequestInterface
} from '../../certificateSummary/certificateSummary';
import { ContractService } from '../contractService/contractsService';
import { GlobalConfigurationService } from '../globalConfigurationService/globalConfigurationService';
import { UtilsService } from '../utilService/utilsService';
import { SimpleStore } from '../../../libs/simpleStore/simpleStore';
import { StoreNamespace } from '../../../../models/storeNamespace';

@injectable()
export class IdentityService {
  constructor (
    private httpClient: ArianeeHttpClient,
    private utils: UtilsService,
    private contractService: ContractService,
    private globalConfigurationService:GlobalConfigurationService,
    private store: SimpleStore) {
  }

  public getSimpleIdentity = async (address: string, issuerQuery?:ConsolidatedIssuerRequest): Promise<IdentitySummary> => {
    const query = this.globalConfigurationService.getMergedQuery({ issuer: issuerQuery });
    const { issuer } = query;

    const { forceRefresh, waitingIdentity } = issuer as ConsolidatedIssuerRequestInterface;

    if (!waitingIdentity) {
      return this.store.get<IdentitySummary>(StoreNamespace.identity, address, () => this.fetchIdentity(address), forceRefresh);
    } else {
      console.warn('you are fetching waiting identity');
      return this.store.get<IdentitySummary>(StoreNamespace.identityWaiting, address, () => this.fetchWaitingIdentity(address), forceRefresh);
    }
  }

  public getIdentity = async (parameters:{
    certificateId: CertificateId,
    address:string,
    query: ConsolidatedCertificateRequest}
  ): Promise<IdentitySummary> => {
    const { query, address } = parameters;
    const { issuer } = this.globalConfigurationService.getMergedQuery(query);

    const { forceRefresh, waitingIdentity } = issuer as ConsolidatedIssuerRequestInterface;
    if (!waitingIdentity) {
      return this.store.get<IdentitySummary>(StoreNamespace.identity, address, () => this.fetchIdentity(address), forceRefresh);
    } else {
      console.warn('you are fetching waiting identity');
      return this.store.get<IdentitySummary>(StoreNamespace.identityWaiting, address, () => this.fetchWaitingIdentity(address), forceRefresh);
    }
  }

  /**
     * fetchWaitingIdentity
     * Get waiting identity from an address and Fallback to approved identity if no waiting identity
     * @param address address of the contract
     * @return Promise{IdentitySummary}
     */
  private fetchWaitingIdentity = async (address: string): Promise<IdentitySummary> => {
    const identityURI = await this.contractService.identityContract.methods
      .waitingURI(address)
      .call();

    if (identityURI) {
      const identityContentData = await this.httpClient.fetch(
        identityURI
      );

      const identityContentSchema = await this.httpClient.fetch(
        identityContentData.$schema
      );

      const hash = await this.utils.cert(
        identityContentSchema,
        identityContentData
      );

      const imprint = await this.contractService.identityContract.methods
        .waitingImprint(address)
        .call();

      const isAuthentic = imprint === hash;

      const isApproved = await this.contractService.identityContract.methods
        .addressIsApproved(address)
        .call();

      return Promise.resolve({
        data: identityContentData,
        isAuthentic: isAuthentic,
        isApproved,
        imprint,
        address
      });
    } else {
      return this.fetchIdentity(address);
    }
  }

  /**
   * fetchIdentity
   * Get approved identity from an address
   * @param address address of the contract
   * @return Promise{IdentitySummary}
   */
  private fetchIdentity = async (address: string): Promise<IdentitySummary> => {
    const identityURI = await this.contractService.identityContract.methods
      .addressURI(address)
      .call();

    if (identityURI) {
      const identityContentData = await this.httpClient.fetch(
        identityURI
      );

      const identityContentSchema = await this.httpClient.fetch(
        identityContentData.$schema
      );

      const hash = await this.utils.cert(
        identityContentSchema,
        identityContentData
      );

      const imprint = await this.contractService.identityContract.methods
        .addressImprint(address)
        .call();

      const isAuthentic = imprint === hash;
      const isApproved = await this.contractService.identityContract.methods
        .addressIsApproved(address)
        .call();

      return Promise.resolve({
        data: identityContentData,
        isAuthentic: isAuthentic,
        isApproved,
        imprint,
        address
      });
    } else {
      console.error(`# ${address} # does not has identity uri or identity`);
      return Promise.resolve({
        data: undefined,
        isAuthentic: false,
        isApproved: false,
        imprint: undefined,
        address
      });
    }
  }
}
