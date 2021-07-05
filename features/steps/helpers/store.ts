import {ArianeeWallet} from '../../../src/core/wallet';
import {CertificateSummary} from '../../../src/core/wallet/certificateSummary';

export class CCStore {
    private users: ArianeeWallet[] = [];
    private tokens: number[] = [];
    private events: number[] = [];

    private cache = {};
    private certificateSummaries = {};

    public getUserWallet (userIndex: number): ArianeeWallet {
      return this.users[userIndex];
    }

    public storeWallet (userIndex: number, wallet: ArianeeWallet) {
      this.users[userIndex] = wallet;
    }

    public getEvent (eventIndex: number):number {
      return this.events[eventIndex];
    }

    public storeEvent (eventIndex: number, eventId: number) {
      this.events[eventIndex] = eventId;
    }

    public getToken (tokenIndex) {
      return this.tokens[tokenIndex];
    }

    public storeToken (tokenIndex, certificateId: number) {
      this.tokens[tokenIndex] = certificateId;
    }

    public storeCustom (key, value) {
      this.cache[key] = value;
    }

    public getCustom (key): any {
      return this.cache[key];
    }

    public getCertificateSummary (certificateId):CertificateSummary {
      return this.certificateSummaries[certificateId];
    }

    public storeCertificateSummary (certificateId, certificateSummary:CertificateSummary) {
      this.certificateSummaries[certificateId] = certificateSummary;
    }
}
