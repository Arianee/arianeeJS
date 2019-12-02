import { injectable, singleton } from 'tsyringe';
import { ConsolidatedCertificateRequest } from '../../certificateSummary/certificateSummary';

@singleton()
export class GlobalConfigurationService {
    public defaultQuery: ConsolidatedCertificateRequest = {
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
    }

    getMergedQuery (query:ConsolidatedCertificateRequest):ConsolidatedCertificateRequest {
      return Object.keys(query)
        .reduce((acc, currKey) => {
          const value = query[currKey];
          if (value === false) {
            acc[currKey] = false;
          } else if (value === true) {
            acc[currKey] = this.defaultQuery[currKey];
          } else if (typeof query === 'object') {
            acc[currKey] = {
              ...this.defaultQuery[currKey],
              ...query[currKey]
            };
          }
          return acc;
        }, {});

      //  issuer===true=> contenu exact
      // si false=> false
      // si object => merge
    }

    setDefaultQuery (defaultQuery: ConsolidatedCertificateRequest): GlobalConfigurationService {
      this.defaultQuery = defaultQuery;
      return this;
    }
}
