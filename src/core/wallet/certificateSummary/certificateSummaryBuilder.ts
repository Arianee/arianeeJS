import { isNullOrUndefined } from './../../libs/isNullOrUndefined';
import {
  CertificateAdvanced,
  CertificateContent,
  CertificateContentContainer,
  CertificateEvents,
  CertificateEventsSummary,
  CertificateIssuer,
  CertificateOwner,
  CertificateSummary
} from './certificateSummary';

export class CertificateSummaryBuilder {
    private _content: CertificateContentContainer;
    private _events: CertificateEvents;
    private _issuer: CertificateIssuer;
    private _isRequestable: boolean;
    private _owner: CertificateOwner;
    private _advanced: CertificateAdvanced;
    private _certificateId: string;
    private _messageSenders:{[key:string]:boolean}

    public setContent (
      data: CertificateContent,
      isAuthentic: boolean,
      imprint:string
    ): CertificateSummaryBuilder {
      this._content = {
        data,
        isAuthentic,
        imprint
      };

      return this;
    }

    public setCertificateId (certificateId: string): CertificateSummaryBuilder {
      this._certificateId = certificateId;

      return this;
    }

    public setArianeeEvents (events: any[]): CertificateSummaryBuilder {
      if (isNullOrUndefined(this._events)) {
        this._events = new CertificateEventsSummary();
      }
      this._events.arianeeEvents = events;

      return this;
    }

    public setEvents (events: any[]): CertificateSummaryBuilder {
      if (isNullOrUndefined(this._events)) {
        this._events = new CertificateEventsSummary();
      }
      this._events.transfer = events;

      return this;
    }

    public setMessageSenders (messageSenders:{[key:string]:boolean}) {
      this._messageSenders = messageSenders;
    }

    public setIsRequestable (isRequestable): CertificateSummaryBuilder {
      this._isRequestable = isRequestable;

      return this;
    }

    public setIssuer (
      isIdentityAuthentic,
      isIdentityVerified,
      imprint:string,
      identity?
    ): CertificateSummaryBuilder {
      this._issuer = {
        identity,
        isIdentityAuthentic,
        isIdentityVerified,
        imprint
      };

      return this;
    }

    public setAdvandced (
      advanded: CertificateAdvanced
    ): CertificateSummaryBuilder {
      this._advanced = advanded;

      return this;
    }

    public setOwner (ownerPublicKey: string, currentWallet:string) {
      this._owner = {
        publicKey: ownerPublicKey,
        isOwner: ownerPublicKey === currentWallet
      };

      return this;
    }

    build (): CertificateSummary<any, any> {
      const arianeCertificate: CertificateSummary = {
        certificateId: this._certificateId,
        content: this._content,
        issuer: this._issuer,
        isRequestable: this._isRequestable,
        owner: this._owner,
        events: this._events,
        advanced: this._advanced,
        messageSenders: this._messageSenders
      };

      Object.keys(arianeCertificate).forEach(key => {
        if (isNullOrUndefined(arianeCertificate[key])) {
          delete arianeCertificate[key];
        }
      });

      return arianeCertificate;
    }
}
