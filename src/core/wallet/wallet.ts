import { ArianeeWallet } from "./arianeeWallet";
import { ArianeeFactory } from "../arianeeFactory/arianeeFactory";
import { isNullOrUndefined } from "util";
import {
  CertificateSummary,
  CertificateSummaryBuilder
} from "../certificateSummary";
import BN from 'bn.js';

export class Wallet extends ArianeeWallet {
  private get overridedMethods() {
    return {
      requestToken: this.customRequestToken,
      hydrateToken: this.customHydrateToken
    };
  }

  public get methods() {
    return {
      balanceOfAria: this.ariaContract.methods.balanceOf,
      balanceOfGas: this.servicesHub.web3.eth.getBalance,
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
    const temporaryWallet = ArianeeFactory().fromPassPhrase(passphrase);

    const proof = this.utils.signProofForRequestToken(
      tokenId,
      this.publicKey,
      temporaryWallet.privateKey
    );

    const requestMethod = this.storeContract.methods.requestToken(
      tokenId,
      proof.messageHash,
      true,
      this.brandDataHubRewardAddress,
      proof.signature
    );

    if (isTest) {
      return requestMethod.call();
    } else {
      return requestMethod.send();
    }
  };

  public getIdentity = async (address: string): Promise<CertificateSummary> => {
    /*
              00. Un objet certificat
              1. this.smartAssetContract.methods.tokenURI => j'ai l'url du certificat
              2. this.smartAssetContract.methods.tokenImprint => signature du contract
              3. Vérifier la signature du Certificate
              4. this.smartAssetContract.methods.ownerOf 
              4. { content: le Certificate, isValidHash:true/false, ownerOf:publicKey, isOwner:true/false}
          
              Getwallet=> tous les certificat qui appartiennent à un wallet
              */

    const identityURI = await this.identityContract.methods
      .addressURI(address)
      .call();

    console.assert(
      identityURI === undefined,
      `uri of identity of ${address} is undefined`
    );

    const identityContent = await this.servicesHub.httpClient
      .fetch(identityURI);

    const identityContentData = identityContent;

    const identityContentSchema = await this.servicesHub.httpClient
      .fetch(identityContentData.$schema)

    const hash = await this.utils.cert(
      identityContentSchema,
      identityContentData
    );

    //address

    const addressImprint = await this.identityContract.methods
      .addressImprint(address)
      .call();

    // const isTokenValid=await this.smartAssetContract.methods.isTokenValid(tokenId)

    return {
      ...identityContentData,
      addressImprint
    };
  };

  public async getMyCertificates(): Promise<CertificateSummary[]> {
    // Fetch number of certificates this user owns
    const numberOfCertificates = await this.smartAssetContract.methods
      .balanceOf(this.publicKey)
      .call();

    // Create an array of range to be able to iterate
    const rangeOfIndex = new Array(numberOfCertificates)
      .fill(null)
      .map((value, index) => index);

    // Fetch tokenIds of certificate with index
    const tokenIds = await Promise.all(
      rangeOfIndex.map(index =>
        this.smartAssetContract.methods
          .tokenOfOwnerByIndex(this.publicKey, index)
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

  public getCertificate = async (
    tokenId: string | number | BN,
    passphrase?: string
  ): Promise<CertificateSummary> => {
    const response = new CertificateSummaryBuilder(this);

    try {
      const tokenURI = await this.smartAssetContract.methods
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
        const temporaryWallet = ArianeeFactory().fromPassPhrase(passphrase);
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
          this.privateKey
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
        .fetch(certificateContentData.$schema)

      const hash = await this.utils.cert(
        certificateSchema,
        certificateContentData
      );

      const tokenImprint = await this.smartAssetContract.methods
        .tokenImprint(tokenId.toString())
        .call();

      response.setIsCertificateValid(hash === tokenImprint);

      const owner = await this.smartAssetContract.methods
        .ownerOf(tokenId.toString())
        .call();
      response.setOwner(owner);

      const issuer = await this.smartAssetContract.methods
        .issuerOf(tokenId.toString())
        .call();

      const identityDetails = await this.getIdentity(issuer);
      response.setIssuerIdentityDetails(identityDetails);
    } catch (err) {
      console.error(err);
    }

    return response.build();
  };

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

    const temporaryWallet = ArianeeFactory().fromPassPhrase(passphrase);

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
      .fetch(certificate.$schema)

      hash = await this.utils.cert(certificateSchema, certificate);
    }
    

    return this.storeContract.methods
      .hydrateToken(
        tokenId,
        hash,
        uri,
        temporaryWallet.publicKey,
        0,
        true,
        this.brandDataHubRewardAddress
      )
      .send()
      .then(i => ({
        ...(<any>i),
        passphrase,
        tokenId
      }));
  };

  public getFaucet = (): Promise<any> => {
    return this.servicesHub.httpClient.fetch(this.servicesHub.arianeeConfig.faucetUrl +
      "&address=" +
      this.account.address)
  };

  public getAria = (): Promise<any> => {
    return this.servicesHub.httpClient.fetch(
      this.servicesHub.arianeeConfig.faucetUrl +
      "&address=" +
      this.account.address +
      "&aria=true"
    );
  };

  public getAriaBalance = async (): Promise<number> => {
    const balance = await this.servicesHub.contracts.ariaContract.methods
      .balanceOf(this.publicKey)
      .call();
    return balance / 100000000;
  };
}
