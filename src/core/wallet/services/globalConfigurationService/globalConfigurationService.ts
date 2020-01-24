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
      advanced: {
        languages: undefined
      },
      messageSenders: true
    }

    getMergedQuery (query:ConsolidatedCertificateRequest = {}):ConsolidatedCertificateRequest {
      if (query === undefined || Object.keys(query).length === 0) {
        return this.defaultQuery;
      } else {
        return Object.keys(this.defaultQuery)
          .reduce((acc, currKey) => {
            const value = query[currKey];
            if (currKey === 'advanced') {
              acc[currKey] = {
                ...this.defaultQuery.advanced,
                ...query.advanced
              };
            } else if (value === undefined || value === false) {
            // not fetching at all
              acc[currKey] = false;
            } else if (value === true) {
              acc[currKey] = typeof this.defaultQuery[currKey] === 'boolean' ? true : this.defaultQuery[currKey];
            } else if (typeof query === 'object') {
              acc[currKey] = {
                ...this.defaultQuery[currKey],
                ...query[currKey]
              };
            }

            return acc;
          }, {});
      }
    }

    setDefaultQuery (defaultQuery: ConsolidatedCertificateRequest): GlobalConfigurationService {
      this.defaultQuery =
          {
            ...defaultQuery
          };

      return this;
    }
}
