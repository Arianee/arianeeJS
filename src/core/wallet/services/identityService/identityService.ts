import { injectable } from 'tsyringe';
import { IdentitySummary } from '../../../../models/arianee-identity';
import { ArianeeHttpClient } from '../../../libs/arianeeHttpClient/arianeeHttpClient';
import { ContractService } from '../contractService/contractsService';
import { UtilsService } from '../utilService/utilsService';
import { WalletService } from '../walletService/walletService';
import { SimpleStore } from '../../../libs/simpleStore/simpleStore';
import { StoreNamespace } from '../../../../models/storeNamespace';

@injectable()
export class IdentityService {
  constructor (private walletService: WalletService,
              private httpClient: ArianeeHttpClient,
              private utils: UtilsService,
              private contractService: ContractService,
              private store: SimpleStore) {
  }

  public getIdentity = async (address: string): Promise<any> => {
    return this.store.get<IdentitySummary>(StoreNamespace.identity, address, () => this.fetchIdentity(address));
  }

  private fetchIdentity = async (address:string): Promise<IdentitySummary> => {
    const identityURI = await this.contractService.identityContract.methods
      .addressURI(address)
      .call();

    if (identityURI) {
      const identityContentData = await this.httpClient.fetchWithCache(
        identityURI
      );

      const identityContentSchema = await this.httpClient.fetchWithCache(
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
        address
      });
    } else {
      return Promise.resolve({
        data: undefined,
        isAuthentic: false,
        isApproved: false,
        address
      });
    }
  }
}
