import { injectable, singleton } from 'tsyringe';
import { ConsolidatedCertificateRequest } from '../../certificateSummary/certificateSummary';

@singleton()
export class GlobalConfigurationService {
    public defaultQuery: ConsolidatedCertificateRequest = {
      isRequestable: true,
      content: true,
      issuer: {
        waitingIdentity: false
      },
      owner: true,
      events: true,
      arianeeEvents: true,
      advanced: true
    }

    setDefaultQuery (defaultQuery: ConsolidatedCertificateRequest): GlobalConfigurationService {
      this.defaultQuery = defaultQuery;
      return this;
    }
}
