import { thisExpression } from "@babel/types";
import { isNullOrUndefined } from "util";
import { sortEvents } from "../../libs/sortEvents";
import {WalletService} from "../services/walletService/walletService";
import {
  CertificateAdvanced,
  CertificateContent,
  CertificateEvents,
  CertificateEventsSummary,
  CertificateIssuer,
  CertificateOwner,
  CertificateSummary,
  CertificiateContent
} from "./certificateSummary";

export class CertificateSummaryBuilder {
  private _content: CertificiateContent;
  private _events: CertificateEvents;
  private _issuer: CertificateIssuer;
  private _isRequestable: boolean;
  private _owner: CertificateOwner;
  private _advanced: CertificateAdvanced;

  constructor (private wallet: WalletService) {}

  public setContent (
    data: CertificateContent,
    isAuthentic: boolean
  ): CertificateSummaryBuilder {
    this._content = {
      data,
      isAuthentic
    };

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
    this._events.transfert = events;

    return this;
  }

  public setIsRequestable (isRequestable): CertificateSummaryBuilder {
    this._isRequestable = isRequestable;

    return this;
  }

  public setIssuer (
    isIdentityAuthentic,
    isIdentityVerified,
    identity?
  ): CertificateSummaryBuilder {
    this._issuer = {
      identity,
      isIdentityAuthentic,
      isIdentityVerified
    };

    return this;
  }

  public setAdvandced (
    advanded: CertificateAdvanced
  ): CertificateSummaryBuilder {
    this._advanced = advanded;

    return this;
  }

  public setOwner (ownerPublicKey: string) {
    this._owner = {
      publicKey: ownerPublicKey,
      isOwner: ownerPublicKey === this.wallet.publicKey
    };

    return this;
  }

  build (): CertificateSummary {
    const arianeCertificate: CertificateSummary = {
      content: this._content,
      issuer: this._issuer,
      isRequestable: this._isRequestable,
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
