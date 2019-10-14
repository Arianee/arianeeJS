import { ArianeeWallet } from "../wallet";
import {
  CertificateAdvanced,
  CertificateContent,
  CertificateEvents,
  CertificateIssuer,
  CertificateOwner,
  CertificateSummary,
  CertificiateContent
} from "./certificateSummary";
import { isNullOrUndefined } from "util";
import { thisExpression } from "@babel/types";

export class CertificateSummaryBuilder {
  private _content: CertificiateContent;
  private _events: CertificateEvents;
  private _issuer: CertificateIssuer;
  private _isTransferable: boolean;
  private _owner: CertificateOwner;
  private _advanced: CertificateAdvanced;

  constructor(private wallet: ArianeeWallet) { }

  public setContent(data: CertificateContent, isAuthentic: boolean): CertificateSummaryBuilder {
    this._content = {
      data,
      isAuthentic
    };

    return this;
  }

  public setArianeeEvents(events: any[]): CertificateSummaryBuilder {
    const allEvents = this._events && this._events.all ? this._events.all : [];

    this._events = {
      ...this._events,
      all: [...allEvents, ...events].sort(this.wallet.utils.sortEvents),
      arianeeEvents: events.sort(this.wallet.utils.sortEvents)
    };

    return this;
  }

  public setEvents(events: any[]): CertificateSummaryBuilder {
    const allEvents = this._events && this._events.all ? this._events.all : [];

    this._events = {
      ...this._events,
      all: [...allEvents, ...events].sort(this.wallet.utils.sortEvents),
      transfert: events.sort(this.wallet.utils.sortEvents),
    };

    return this;
  }

  public setIsTransferable(isTransferable): CertificateSummaryBuilder {
    this._isTransferable = isTransferable;

    return this;
  }

  public setIssuer(isIdentityAuthentic, isIdentityVerified, identity?): CertificateSummaryBuilder {
    this._issuer = {
      identity,
      isIdentityAuthentic,
      isIdentityVerified
    };

    return this;
  }

  public setAdvandced(advanded: CertificateAdvanced): CertificateSummaryBuilder {

    this._advanced = advanded;

    return this;
  }

  public setOwner(ownerPublicKey: string) {
    this._owner = {
      publicKey: ownerPublicKey,
      isOwner: ownerPublicKey === this.wallet.publicKey,
    };

    return this;
  }

  build(): CertificateSummary {
    const arianeCertificate: CertificateSummary = {
      content: this._content,
      issuer: this._issuer,
      isTransferable: this._isTransferable,
      owner: this._owner,
      events: this._events,
      advanced: this._advanced
    };

    Object.keys(arianeCertificate).forEach(key => {
      if (isNullOrUndefined(arianeCertificate[key])) {
        delete arianeCertificate[key];
      }
    });

    return arianeCertificate;
  }
}