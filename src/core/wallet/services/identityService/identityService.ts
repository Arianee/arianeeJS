import {inject, injectable} from "tsyringe";
import {IdentitySummary} from "../../../../models/arianee-identity";
import {UtilsService} from "../utilService/utilsService";
import {ArianeeHttpClient} from "../../../libs/arianeeHttpClient/arianeeHttpClient";
import {ArianeeWallet} from "../../wallet";
import {ContractService} from "../contractService/contractsService";
import {WalletService} from "../walletService/walletService";

@injectable()
export class IdentityService {

  constructor(private walletService: WalletService,
              private httpClient: ArianeeHttpClient,
              private utils: UtilsService,
              private contractService: ContractService) {
  }

  public getIdentity = async (address: string): Promise<IdentitySummary> => {
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

      return {
        data: identityContentData,
        isAuthentic: isAuthentic,
        isApproved,
        address
      };
    } else {
      return {
        data: undefined,
        isAuthentic: false,
        isApproved: false,
        address: undefined
      };
    }
  };
}
