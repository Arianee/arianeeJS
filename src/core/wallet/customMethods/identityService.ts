import {IdentitySummary} from "../../../models/arianee-identity";
import {ArianeeWallet} from "../wallet";

export class IdentityService {
  constructor(private wallet: ArianeeWallet) {
  }

  public getIdentity = async (address: string): Promise<IdentitySummary> => {
    const identityURI = await this.wallet.identityContract.methods
      .addressURI(address)
      .call();

    if (identityURI) {
      const identityContentData = await this.wallet.servicesHub.httpClient.fetch(
        identityURI
      );

      const identityContentSchema = await this.wallet.servicesHub.httpClient.fetch(
        identityContentData.$schema
      );

      const hash = await this.wallet.utils.cert(
        identityContentSchema,
        identityContentData
      );

      const imprint = await this.wallet.identityContract.methods
        .addressImprint(address)
        .call();

      const isAuthentic = imprint === hash;
      const isApproved = await this.wallet.identityContract.methods
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
