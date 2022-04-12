import { get } from 'lodash';
import { injectable } from 'tsyringe';
import { IdentitySummary } from '../../../../models/arianee-identity';
import { ArianeeBrandIdentityi18n } from '../../../../models/jsonSchema/identities/ArianeeBrandIdentityi18n';
import { StoreNamespace } from '../../../../models/storeNamespace';
import { isIdentitySchemai18n } from '../../../libs';
import { ArianeeHttpClient } from '../../../libs/arianeeHttpClient/arianeeHttpClient';
import { replaceLanguageIdentityContentWithFavUserLanguage } from '../../../libs/i18nSchemaLanguageManager/i18nSchemaLanguageManager';
import { SimpleStore } from '../../../libs/simpleStore/simpleStore';
import {
  ConsolidatedCertificateRequest,
  ConsolidatedIssuerRequest,
  ConsolidatedIssuerRequestInterface
} from '../../certificateSummary/certificateSummary';
import { ContractService } from '../contractService/contractsService';
import { GlobalConfigurationService } from '../globalConfigurationService/globalConfigurationService';
import { UtilsService } from '../utilService/utilsService';

@injectable()
export class IdentityService {
  constructor (
    private httpClient: ArianeeHttpClient,
    private utils: UtilsService,
    private contractService: ContractService,
    private globalConfigurationService:GlobalConfigurationService,
    private store: SimpleStore) {
  }

  public getIdentityByShortId = async (shortId:string) => {
    const address = await this.contractService.identityContract.methods.addressFromId(shortId).call();
    return this.getIdentity({ address });
  }

  public getSimpleIdentity = async (address: string, issuerQuery?:ConsolidatedIssuerRequest): Promise<IdentitySummary> => {
    let query;
    if (issuerQuery) {
      query = this.globalConfigurationService.getMergedQuery({ issuer: issuerQuery });
    } else {
      query = this.globalConfigurationService.getMergedQuery();
    }

    return this.getIdentity({ address, query });
  }

  public getIdentity = async (parameters:{
    address:string,
    query?: ConsolidatedCertificateRequest}
  ): Promise<IdentitySummary> => {
    const { query, address } = parameters;
    const { issuer, advanced } = this.globalConfigurationService.getMergedQuery(query);
    let identitySummary:IdentitySummary<ArianeeBrandIdentityi18n>;

    const { forceRefresh, waitingIdentity } = issuer as ConsolidatedIssuerRequestInterface;
    if (!waitingIdentity) {
      identitySummary = await this.store.get<IdentitySummary<ArianeeBrandIdentityi18n>>(StoreNamespace.identity, address, () => this.fetchIdentity(address), forceRefresh)
        .catch(d => d);
    } else {
      console.warn('you are fetching waiting identity');
      identitySummary = await this.store.get<IdentitySummary<ArianeeBrandIdentityi18n>>(StoreNamespace.identityWaiting, address, () => this.fetchWaitingIdentity(address), forceRefresh)
        .catch(d => d);
    }
    const identityContent:ArianeeBrandIdentityi18n = identitySummary.data;
    if (get(advanced, 'languages') &&
      get(identitySummary, 'data') &&
      isIdentitySchemai18n(identityContent)) {
      identitySummary.data = replaceLanguageIdentityContentWithFavUserLanguage(identityContent, advanced.languages) as any;
    }

    return identitySummary;
  }

  /**
     * fetchWaitingIdentity
     * Get waiting identity from an address and Fallback to approved identity if no waiting identity
     * @param address address of the contract
     * @return Promise{IdentitySummary}
     */
  private fetchWaitingIdentity = async (address: string): Promise<IdentitySummary> => {
    try {
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
      }
    } catch {
      console.warn(`# ${address} # does not have waiting identity uri or identity`);
    }
    return this.fetchIdentity(address);
  }

  /**
   * fetchIdentity
   * Get approved identity from an address
   * @param address address of the contract
   * @return Promise{IdentitySummary}
   */
  private fetchIdentity = async (address: string): Promise<IdentitySummary> => {
    try {
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
      }
    } catch (e) {
      console.warn(`# ${address} # does not have identity uri or identity`);
    }

    return Promise.reject({
      data: undefined,
      isAuthentic: false,
      isApproved: false,
      imprint: undefined,
      address
    });
  }
}
