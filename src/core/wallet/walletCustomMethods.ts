import { isNullOrUndefined } from "util";
import {
  CertificateSummary,
  CertificateSummaryBuilder
} from "../certificateSummary";
import { Utils } from "../libs/utils";
import { ServicesHub } from "../servicesHub";
import { ArianeeWallet } from "./wallet";

export class WalletCustomMethods {
  private servicesHub: ServicesHub;
  private utils: Utils;

  constructor(private wallet: ArianeeWallet) {
    this.servicesHub = this.wallet.servicesHub;
    this.utils = this.wallet.utils;
  }

  private get overridedMethods() {
    return {
      requestToken: this.customRequestToken,
      hydrateToken: this.customHydrateToken
    };
  }

  public getMethods() {
    return {
      getCertificate: this.getCertificate,
      getMyCertificates: this.getMyCertificates,
      balanceOfAria: <any>this.wallet.ariaContract.methods.balanceOf,
      balanceOfGas: this.servicesHub.web3.eth.getBalance,
      createCertificateTransferLink: this.createCertificateTransferLink,
      createCertificateProofLink: this.createCertificateProofLink,
      getCertificateFromLink: this.getCertificateFromLink,
      getCertificateTransferEvents: this.getCertificateTransferEvents,
      ...this.overridedMethods
    };
  }

  /**
   * Simplified request token
   * @param tokenId
   * @param passphrase
   */
  private customRequestToken = async (
    tokenId: number,
    passphrase: string,
    isTest = false
  ) => {
    const temporaryWallet = this.servicesHub.walletFactory().fromPassPhrase(passphrase);

    const proof = this.utils.signProofForRequestToken(
      tokenId,
      this.wallet.publicKey,
      temporaryWallet.privateKey
    );

    const requestMethod = this.wallet.storeContract.methods.requestToken(
      tokenId,
      proof.messageHash,
      true,
      this.wallet.brandDataHubRewardAddress,
      proof.signature
    );

    if (isTest) {
      return requestMethod.call();
    } else {
      return requestMethod.send();
    }
  }

  private getIdentity = async (address: string): Promise<any> => {

    const identityURI = await this.wallet.identityContract.methods
      .addressURI(address)
      .call();

    if (identityURI) {
      const identityContent = await this.servicesHub.httpClient
        .fetch(identityURI);

      const identityContentData = identityContent;

      const identityContentSchema = await this.servicesHub.httpClient
        .fetch(identityContentData.$schema);

      const hash = await this.utils.cert(
        identityContentSchema,
        identityContentData
      );

      //address

      const addressImprint = await this.wallet.identityContract.methods
        .addressImprint(address)
        .call();

      // const isTokenValid=await this.smartAssetContract.methods.isTokenValid(tokenId)

      return {
        ...identityContentData,
        addressImprint,
        identityExist: true
      };
    }
    else {
      return undefined;
    }

  }

  private async getMyCertificates(): Promise<CertificateSummary[]> {
    // Fetch number of certificates this user owns
    const numberOfCertificates = await this.wallet.smartAssetContract.methods
      .balanceOf(this.wallet.publicKey)
      .call();

    // Create an array of range to be able to iterate
    const rangeOfIndex = new Array(numberOfCertificates)
      .fill(null)
      .map((value, index) => index);

    // Fetch tokenIds of certificate with index
    const tokenIds = await Promise.all(
      rangeOfIndex.map(index =>
        this.wallet.smartAssetContract.methods
          .tokenOfOwnerByIndex(this.wallet.publicKey, index)
          .call()
      )
    );

    // Fetch details of each certificate
    const certificates = await Promise.all(
      tokenIds.map(tokenId => this.getCertificate(tokenId))
    );

    return certificates;
  }

  // Ajouter une passphrase à un token
  //  this.smartAssetContract.methods.addTokenAccess()

  private getCertificateFromLink(link: string) {
    const { tokenId, passphrase } = this.utils.readLink(link);

    return this.getCertificate(tokenId, passphrase);
  }

  private getCertificate = async (
    tokenId: string | number | any,
    passphrase?: string
  ): Promise<CertificateSummary> => {
    const response = new CertificateSummaryBuilder(this.wallet);

    try {
      const tokenURI = await this.wallet.smartAssetContract.methods
        .tokenURI(tokenId.toString())
        .call();

      // REGULAR HTTP
      /*  const certificateContent = await this.arianeeState.httpClient.get(
        tokenURI,
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      const certificateContentData = certificateContent.data;

*/
      // RPC:
      /*
      const certificateContent = await this.arianeeState.httpClient.get(
        tokenURI,
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      const certificateContentData = certificateContent.data;

*/
      let proof;

      if (passphrase) {
        const temporaryWallet = this.servicesHub.walletFactory().fromPassPhrase(passphrase);
        proof = this.utils.signProof(
          JSON.stringify({
            tokenId: tokenId,
            timestamp: new Date()
          }),
          temporaryWallet.privateKey
        );
      } else {
        proof = this.utils.signProof(
          JSON.stringify({
            tokenId: tokenId,
            timestamp: new Date()
          }),
          this.wallet.privateKey
        );
      }

      const certificateContentData: any = await new Promise(
        (resolve, reject) => {
          this.servicesHub.RPC.withURI(tokenURI).request(
            "certificate.read",
            {
              tokenId: tokenId,
              authentification: {
                hash: proof.messageHash,
                signature: proof.signature,
                message: proof.message
              }
            },
            function (err, error, result) {
              if (err) reject(err);
              if (error) reject(error);
              if (result) resolve(result);
            }
          );
        }
      );

      response.setContent(certificateContentData);

      const certificateSchema = await this.servicesHub.httpClient
        .fetch(certificateContentData.$schema);

      const hash = await this.utils.cert(
        certificateSchema,
        certificateContentData
      );

      const tokenImprint = await this.wallet.smartAssetContract.methods
        .tokenImprint(tokenId.toString())
        .call();

      response.setIsCertificateValid(hash === tokenImprint);

      const owner = await this.wallet.smartAssetContract.methods
        .ownerOf(tokenId.toString())
        .call();
      response.setOwner(owner);

      const issuer = await this.wallet.smartAssetContract.methods
        .issuerOf(tokenId.toString())
        .call();

      const identityDetails = await this.getIdentity(issuer);
      response.setIssuerIdentityDetails(identityDetails);
    } catch (err) {
      console.error(err);
    }

    return response.build();
  }

  private customHydrateToken = async (data: {
    uri: string;
    hash?: string;
    tokenId?: number;
    passphrase?: string;
    tokenRecoveryTimestamp?: number | number;
    initialKeyIsRequestKey?: boolean;
    certificate?: { $schema: string;[key: string]: any };
  }): Promise<any> => {
    let {
      uri,
      hash,
      tokenId,
      passphrase,
      tokenRecoveryTimestamp,
      initialKeyIsRequestKey,
      certificate
    } = data;

    // hash=
    // si il passe un complexe hash avec uri.
    // Cert => est une alternative au hash.

    tokenId = tokenId || Math.ceil(Math.random() * 10000000);

    const now = new Date();
    tokenRecoveryTimestamp =
      tokenRecoveryTimestamp ||
      Math.round(now.setDate(now.getDate()) / 1000) + 90 * 60 * 60 * 24;

    initialKeyIsRequestKey =
      initialKeyIsRequestKey === undefined ? initialKeyIsRequestKey : true;

    passphrase = passphrase || this.utils.createPassphrase();

    const temporaryWallet = this.servicesHub.walletFactory().fromPassPhrase(passphrase);

    console.assert(
      !(hash && certificate),
      "you should choose between hash and certificate"
    );
    console.assert(
      !(isNullOrUndefined(hash) && isNullOrUndefined(certificate)),
      "you should pass at least on parameter"
    );

    if (certificate) {
      const certificateSchema = await this.servicesHub.httpClient
        .fetch(certificate.$schema);

      hash = await this.utils.cert(certificateSchema, certificate);
    }

    return this.wallet.storeContract.methods
      .hydrateToken(
        tokenId,
        hash,
        uri,
        temporaryWallet.publicKey,
        0,
        true,
        this.wallet.brandDataHubRewardAddress
      )
      .send()
      .then(i => ({
        ...(<any>i),
        passphrase,
        tokenId
      }));
  }

  private createCertificateTransferLink = async (tokenId: number, passphrase?: string) => {
    if (!passphrase) {
      passphrase = this.utils.createPassphrase();
    }
    await this.setPassphrase(tokenId, passphrase, 1);

    return this.utils.createLink(tokenId, passphrase);
  }

  private createCertificateProofLink = async (tokenId: number, passphrase?: string) => {
    if (!passphrase) {
      passphrase = this.utils.createPassphrase();
    }
    await this.setPassphrase(tokenId, passphrase, 2);

    return this.utils.createLink(tokenId, passphrase);
  }

  private async setPassphrase(tokenId: number, passphrase: string, type: number) {
    const temporaryWallet = this.servicesHub.walletFactory().fromPassPhrase(passphrase);

    return this.wallet
      .smartAssetContract
      .methods
      .addTokenAccess(tokenId, temporaryWallet.publicKey, true, type)
      .send();

  }
  public getFaucet = (): Promise<any> => {
    return this.servicesHub.httpClient.fetch(this.servicesHub.arianeeConfig.faucetUrl +
      "&address=" +
      this.wallet.account.address);
  }

  public getAria = (): Promise<any> => {
    return this.servicesHub.httpClient.fetch(
      this.servicesHub.arianeeConfig.faucetUrl +
      "&address=" +
      this.wallet.account.address +
      "&aria=true"
    );
  }

  public getAriaBalance = async (): Promise<number> => {
    const balance = await this.servicesHub.contracts.ariaContract.methods
      .balanceOf(this.wallet.publicKey)
      .call();

    return balance / 100000000;
  }

  private getCertificateTransferEvents = async (tokenId: number): Promise<any> => {
    const sortedEvents = await this.servicesHub.contracts.smartAssetContract.getPastEvents('Transfer',
      { filter: { _tokenId: tokenId }, fromBlock: 0, toBlock: 'latest' })
      .then(events => events.sort(this.utils.sortEvents));

    return Promise.all(sortedEvents
      .map(event => this.getIdentity(event.returnValues._to)
        .then(identity => ({ ...event, identity: identity }))));
  }

}
