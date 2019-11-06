import { injectable } from 'tsyringe';
import { isNullOrUndefined } from 'util';
import { blockchainEvent } from '../../../../models/blockchainEvents';
import { CertificateId } from '../../../../models/CertificateId';
import { ExtendedBoolean } from '../../../../models/extendedBoolean';
import { ArianeeHttpClient } from '../../../libs/arianeeHttpClient/arianeeHttpClient';
import { sortEvents } from '../../../libs/sortEvents';
import { CertificateSummaryBuilder } from '../../certificateSummary';
import { CertificateSummary, ConsolidatedCertificateRequest } from '../../certificateSummary/certificateSummary';
import { CertificateDetails } from '../CertificateDetailsService/certificatesDetailsService';
import { ConfigurationService } from '../configurationService/configurationService';
import { ContractService } from '../contractService/contractsService';
import { EventService } from '../eventService/eventsService';
import { IdentityService } from '../identityService/identityService';
import { UtilsService } from '../utilService/utilsService';
import { WalletService } from '../walletService/walletService';
import { Web3Service } from '../web3Service/web3Service';

@injectable()
export class CertificateService {
  constructor (
        private utils: UtilsService,
        private httpClient: ArianeeHttpClient,
        private configurationService: ConfigurationService,
        private contractService: ContractService,
        private certificateDetails: CertificateDetails,
        private identityService: IdentityService,
        private walletService: WalletService,
        private eventService: EventService,
        private web3Service: Web3Service
  ) {
  }

    public customHydrateToken = async (data: {
        uri: string;
        hash?: string;
        certificateId?: number;
        passphrase?: string;
        tokenRecoveryTimestamp?: number | number;
        sameRequestOwnershipPassphrase?: boolean;
        content?: { $schema: string; [key: string]: any };
    }): Promise<any> => {
      let {
        uri,
        hash,
        certificateId,
        passphrase,
        tokenRecoveryTimestamp,
        sameRequestOwnershipPassphrase,
        content
      } = data;

      // hash=
      // si il passe un complexe hash avec uri.
      // Cert => est une alternative au hash.

      certificateId = certificateId || Math.ceil(Math.random() * 10000000);

      const now = new Date();
      tokenRecoveryTimestamp =
            tokenRecoveryTimestamp ||
            Math.round(now.setDate(now.getDate()) / 1000) + 90 * 60 * 60 * 24;

      sameRequestOwnershipPassphrase =
            sameRequestOwnershipPassphrase !== undefined
              ? sameRequestOwnershipPassphrase
              : true;

      passphrase = passphrase || this.utils.createPassphrase();

      const temporaryWallet = this.configurationService
        .walletFactory()
        .fromPassPhrase(passphrase);

      console.assert(
        !(hash && content),
        'you should choose between hash and certificate'
      );
      console.assert(
        !(isNullOrUndefined(hash) && isNullOrUndefined(content)),
        'you should pass at least on parameter'
      );

      if (content) {
        const certificateSchema = await this.httpClient.fetchWithCache(
          content.$schema
        );

        hash = await this.utils.cert(certificateSchema, content);
      }

      return this.contractService.storeContract.methods
        .hydrateToken(
          certificateId,
          hash,
          uri,
          temporaryWallet.publicKey,
          tokenRecoveryTimestamp,
          sameRequestOwnershipPassphrase,
          this.configurationService.arianeeConfiguration.brandDataHubReward.address
        )
        .send()
        .then(i => ({
          ...(<any>i),
          passphrase,
          certificateId: certificateId
        }));
    }

    private customRequestTokenFactory = (certificateId, passphrase) => {
      const temporaryWallet = this.configurationService
        .walletFactory()
        .fromPassPhrase(passphrase);

      const proof = this.utils.signProofForRequestToken(
        certificateId,
        this.walletService.publicKey,
        temporaryWallet.privateKey
      );

      return this.contractService.storeContract.methods.requestToken(
        certificateId,
        proof.messageHash,
        true,
        this.configurationService.arianeeConfiguration.brandDataHubReward.address,
        proof.signature
      );
    }

    public isCertificateOwnershipRequestable = async (
      certificateId,
      passphrase
    ): Promise<ExtendedBoolean> => {
      try {
        await this.customRequestTokenFactory(certificateId, passphrase).call();

        return {
          isTrue: true,
          code: 'certicate.requestable',
          message: 'certificate is requestable'
        };
      } catch (err) {
        return {
          isTrue: false,
          code: 'certicate.notrequestable',
          message: 'certificate is not requestable'
        };
      }
    }

    public getCertificate = async (
      certificateId: CertificateId,
      passphrase?: string,
      query?: ConsolidatedCertificateRequest
    ): Promise<CertificateSummary> => {
      const response = new CertificateSummaryBuilder();
      response.setCertificateId(certificateId);

      const requestQueue = [];

      if (isNullOrUndefined(query) || query.content) {
        const contentDetails = this.certificateDetails.getCertificateContent(
          certificateId,
          passphrase,
          response
        );

        requestQueue.push(
          contentDetails
        );
      }

      if (isNullOrUndefined(query) || query.owner) {
        requestQueue.push(
          this.certificateDetails.getCertificateOwner(certificateId)
            .then(owner => response.setOwner(owner, this.walletService.publicKey)));
      }

      if (isNullOrUndefined(query) || query.issuer) {
        const issuerDetails = this.certificateDetails.getCertificateIssuer(certificateId)
          .then(identityDetails => {
            response.setIssuer(
              identityDetails.isAuthentic,
              identityDetails.isApproved,
              identityDetails
            );
          });
        requestQueue.push(issuerDetails);
      }

      if (isNullOrUndefined(query) || query.isRequestable) {
        const isRequestable = this.isCertificateOwnershipRequestable(certificateId, passphrase).then(
          isRequestable => response.setIsRequestable(isRequestable.isTrue)
        );
        requestQueue.push(isRequestable);
      }

      if (isNullOrUndefined(query) || query.events) {
        const eventsDetails = this.eventService.getCertificateTransferEvents(certificateId).then(events => {
          response.setEvents(events);
        });
        requestQueue.push(eventsDetails);
      }

      if (isNullOrUndefined(query) || query.arianeeEvents) {
        const arianeeEvents = this.eventService.getCertificateArianeeEvents(certificateId, passphrase).then(events => {
          response.setArianeeEvents(events);
        });
        requestQueue.push(arianeeEvents);
      }

      try {
        await Promise.all(requestQueue);
      } catch (err) {
        console.error(err);
      }

      return response.build();
    }

    public getMyCertificates = async (
      query?: ConsolidatedCertificateRequest
    ): Promise<CertificateSummary[]> => {
      // Fetch number of certificates this user owns
      const numberOfCertificates = await this.contractService.smartAssetContract.methods
        .balanceOf(this.walletService.publicKey)
        .call();

      // Create an array of range to be able to iterate
      const rangeOfIndex = [];

      for (let i = 0; i < <any>numberOfCertificates; i++) {
        rangeOfIndex.push(i);
      }

      // Fetch certificateIds of certificate with index
      const certificateIds = await Promise.all(
        rangeOfIndex.map(index =>
          this.contractService.smartAssetContract.methods
            .tokenOfOwnerByIndex(this.walletService.publicKey, index)
            .call()
        )
      );

      const results = [];
      // Fetch details of each certificate
      await Promise.all(
        certificateIds.map(certificateId =>
          this.getCertificate(certificateId, undefined, query).then(certificate =>
            results.push(certificate)
          )
        )
      );

      return results.reverse();
    }

    public getMyCertificatesGroupByIssuer = async (query?: ConsolidatedCertificateRequest)
        : Promise<{ [key: string]: CertificateSummary[] }> => {
      const certificates = await this.getMyCertificates(query);

      const groupByIssuerCertificates = certificates
        .reduce<{ [key: string]: CertificateSummary[] }>((accumulator, currentValue) => {
          const issuerAddress = currentValue.issuer.identity.address;
          if (!Object.prototype.hasOwnProperty.call(accumulator, issuerAddress)) {
            accumulator[issuerAddress] = [];
          }
          accumulator[issuerAddress].push(currentValue);

          return accumulator;
        }, {});

      return groupByIssuerCertificates;
    }

    public createCertificateRequestOwnershipLink = async (
      certificateId: number,
      passphrase?: string
    ) => {
      if (!passphrase) {
        passphrase = this.utils.createPassphrase();
      }
      await this.setPassphrase(certificateId, passphrase, 1);

      return this.utils.createLink(certificateId, passphrase);
    }

    private async setPassphrase (
      certificateId: number,
      passphrase: string,
      type: number
    ) {
      const temporaryWallet = this.configurationService
        .walletFactory()
        .fromPassPhrase(passphrase);

      return this.contractService.smartAssetContract.methods
        .addTokenAccess(certificateId, temporaryWallet.publicKey, true, type)
        .send();
    }

    public createCertificateProofLink = async (
      certificateId: number,
      passphrase?: string
    ) => {
      if (!passphrase) {
        passphrase = this.utils.createPassphrase();
      }
      await this.setPassphrase(certificateId, passphrase, 2);

      return this.utils.createLink(certificateId, passphrase, 'proof');
    }

    // Ajouter une passphrase à un token
    //  this.smartAssetContract.methods.addTokenAccess()

    public getCertificateFromLink (link: string) {
      const { certificateId, passphrase } = this.utils.readLink(link);

      return this.getCertificate(certificateId, passphrase);
    }

    public isCertificateProofValid = async (
      certificateId: number,
      passphrase: string
    ): Promise<ExtendedBoolean> => {
      return this.isProofValidSince(certificateId, passphrase, 2, 300);
    }

    private isProofValid = async (
      certificateId,
      passphrase,
      tokenType
    ): Promise<boolean> => {
      const tokenHashedAccess = await this.contractService.smartAssetContract.methods
        .tokenHashedAccess(certificateId, tokenType)
        .call();

      const proof = this.configurationService.walletFactory().fromPassPhrase(passphrase)
        .publicKey;
      if (/^0x0+$/.test(tokenHashedAccess)) {
        return false;
      } else {
        return proof === tokenHashedAccess;
      }
    }

    private isProofValidSince = async (
      certificateId: number,
      passphrase: string,
      tokenType: number,
      validity: number
    ): Promise<ExtendedBoolean> => {
      const tokenHashedAccess = await this.contractService.smartAssetContract.methods
        .tokenHashedAccess(certificateId, tokenType)
        .call();

      const proofValid = await this.isProofValid(
        certificateId,
        passphrase,
        tokenType
      );

      if (!proofValid) {
        return {
          isTrue: false,
          code: 'proof.token.dontmatch',
          message: 'token proof does not match'
        };
      }

      const events = await this.contractService.smartAssetContract.getPastEvents(
        blockchainEvent.smartAsset.tokenAccessAdded,
        {
          fromBlock: 0,
          toBlock: 'latest',
          filter: {
            _tokenId: certificateId,
            _encryptedTokenKey: tokenHashedAccess,
            _tokenType: tokenType
          }
        }
      );

      events.sort(sortEvents).reverse();
      const lastEvent = events[0];
      const blockTimestamp = await this.utils.getTimestampFromBlock(lastEvent.blockNumber);

      if (
        !this.utils.timestampIsMoreRecentThan(blockTimestamp, validity)
      ) {
        return {
          isTrue: false,
          code: 'proof.token.tooold',
          message: 'token proof does not match'
        };
      }
      const lastEventTransaction = await this.web3Service.web3.eth.getTransaction(
        lastEvent.transactionHash
      );

      const actualOwner = await this.contractService.smartAssetContract.methods
        .ownerOf(certificateId)
        .call();
      if (lastEventTransaction.from !== actualOwner) {
        return {
          isTrue: false,
          code: 'proof.token.notowner',
          message: 'token proof does not match'
        };
      }

      return {
        isTrue: true,
        code: 'proof.token.valid',
        message: 'proof is valid'
      };
    }

    public customRequestToken = async (
      certificateId: number,
      passphrase: string
    ) => {
      return this.customRequestTokenFactory(certificateId, passphrase).send();
    }
}
