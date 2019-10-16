import {ArianeeWallet} from "../wallet";
import {CertificateContent, CertificateSummary} from "./certificateSummary";

export class CertificateSummaryBuilder {
    private _content: CertificateContent;
    private _issuerIdentityContent: any;
    private _owner: string;
    private _isCertificateValid: boolean;
  
    constructor(private wallet: ArianeeWallet) {}
  
    public setContent(content: CertificateContent): CertificateSummaryBuilder {
      this._content = content;

      return this;
    }
  
    public setIsCertificateValid(value: boolean): CertificateSummaryBuilder {
      this._isCertificateValid = value;

      return this;
    }
  
    public setOwner(owner: string): CertificateSummaryBuilder {
      this._owner = owner;

      return this;
    }
  
    public setIssuerIdentityDetails(
      identyDetails: any
    ): CertificateSummaryBuilder {
      this._issuerIdentityContent = identyDetails;

      return this;
    }
  
    build(): CertificateSummary {
      return {
        content: this._content,
        isCertificateValid: this._isCertificateValid,
        isOwner: this._owner === this.wallet.publicKey,
        owner: this._owner,
        isIssuerExist: this._issuerIdentityContent,
        isIssuerIdentity: false,
        isIssuerValid: false
      };
    }
  }