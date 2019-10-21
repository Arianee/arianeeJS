import {ExtendedBoolean} from "models/extendedBoolean";
import {isNullOrUndefined} from "util";
import {blockchainEvent} from "../../models/blockchainEvents";
import {CertificateId} from "../../models/CertificateId";
import {CertificateSummary, CertificateSummaryBuilder} from "../certificateSummary";
import {ConsolidatedCertificateRequest} from "../certificateSummary/certificateSummary";
import {sortEvents} from '../libs/sortEvents';
import {Utils} from "../libs/utils";
import {ServicesHub} from "../servicesHub";
import {CertificateDetails} from './customMethods/certificatesDetails';
import {IdentityService} from "./customMethods/identityService";
import {ArianeeWallet} from "./wallet";

export class WalletCustomMethods {
    private servicesHub: ServicesHub;
    private utils: Utils;
    private certificateDetails: CertificateDetails;
    private identityService: IdentityService;

    constructor(private wallet: ArianeeWallet) {
        this.servicesHub = this.wallet.servicesHub;
        this.utils = this.wallet.utils;
        this.identityService = new IdentityService(this.wallet);
        this.certificateDetails = new CertificateDetails(this.wallet, this.identityService);
    }

    public getMethods() {
        return {
            getCertificate: this.getCertificate,
            getMyCertificates: this.getMyCertificates,
            balanceOfAria: <any>this.wallet.ariaContract.methods.balanceOf,
            balanceOfGas: this.servicesHub.web3.eth.getBalance,
            createCertificateRequestOwnershipLink: this.createCertificateRequestOwnershipLink,
            createCertificateProofLink: this.createCertificateProofLink,
            getCertificateFromLink: this.getCertificateFromLink,
            getCertificateTransferEvents: this.getCertificateTransferEvents,
            isCertificateProofValid: this.isCertificateProofValid,
            getCertificateArianeeEvents: this.getCertificateArianeeEvents,
            isCertificateOwnershipRequestable: this.isCertificateOwnershipRequestable,
            requestCertificateOwnership: this.customRequestToken,
            createCertificate: this.customHydrateToken
        };
    }

    /**
     * Check if this certificate is requestable with certificateId and passphrase
     * @param certificateId
     * @param passphrase
     */
    private isCertificateOwnershipRequestable = async (certificateId, passphrase): Promise<ExtendedBoolean> => {
        try {
            await this.customRequestTokenFactory(certificateId, passphrase).call();

            return {isTrue: true, code: 'certicate.requestable', message: 'certificate is requestable'};
        } catch (err) {
            return {isTrue: false, code: 'certicate.notrequestable', message: 'certificate is not requestable'};
        }
    }

    private customRequestTokenFactory = (certificateId, passphrase) => {
        const temporaryWallet = this.servicesHub.walletFactory().fromPassPhrase(passphrase);

        const proof = this.utils.signProofForRequestToken(
            certificateId,
            this.wallet.publicKey,
            temporaryWallet.privateKey
        );

        return this.wallet.storeContract.methods.requestToken(
            certificateId,
            proof.messageHash,
            true,
            this.wallet.brandDataHubRewardAddress,
            proof.signature
        );
    }
    /**
     * Simplified request token
     * @param certificateId
     * @param passphrase
     */
    private customRequestToken = async (
        certificateId: number,
        passphrase: string) => {

        return this.customRequestTokenFactory(certificateId, passphrase).send();
    }

    private getMyCertificates = async (query?: ConsolidatedCertificateRequest): Promise<CertificateSummary[]> => {
        // Fetch number of certificates this user owns
        const numberOfCertificates = await this.wallet.smartAssetContract.methods
            .balanceOf(this.wallet.publicKey)
            .call();

        // Create an array of range to be able to iterate
        const rangeOfIndex = [];

        for (let i = 0; i < (<any>numberOfCertificates); i++) {
            rangeOfIndex.push(i);
        }
        // Fetch certificateIds of certificate with index
        const certificateIds = await Promise.all(
            rangeOfIndex.map(index =>
                this.wallet.smartAssetContract.methods
                    .tokenOfOwnerByIndex(this.wallet.publicKey, index)
                    .call()
            )
        );

        const results = [];
        // Fetch details of each certificate
        await Promise.all(
            certificateIds.map(certificateId => this.getCertificate(certificateId, undefined, query)
                .then(certificate => results.push(certificate))
            )
        );

        return results;
    }

    // Ajouter une passphrase à un token
    //  this.smartAssetContract.methods.addTokenAccess()

    private getCertificateFromLink(link: string) {
        const {certificateId, passphrase} = this.utils.readLink(link);

        return this.getCertificate(certificateId, passphrase);
    }

    private getCertificate = async (
        certificateId: CertificateId,
        passphrase?: string,
        query?: ConsolidatedCertificateRequest,
    ): Promise<CertificateSummary> => {

        const response = new CertificateSummaryBuilder(this.wallet);
        const requestQueue = [];

        if (isNullOrUndefined(query) || query.content) {
            requestQueue.push(this.certificateDetails.getContentFactory(certificateId, passphrase, response));
        }

        if (isNullOrUndefined(query) || query.owner) {
            requestQueue.push(this.certificateDetails.getOwnerFactory(certificateId, response));
        }

        if (isNullOrUndefined(query) || query.issuer) {
            const issuer = await this.wallet.smartAssetContract.methods
                .issuerOf(certificateId.toString())
                .call();

            const identityDetails = await this.identityService.getIdentity(issuer);

            response.setIssuer(identityDetails.isAuthentic, identityDetails.isApproved, identityDetails);
        }

        if (isNullOrUndefined(query) || query.isRequestable) {
            const requestableFactory = () => this.isCertificateOwnershipRequestable(certificateId, passphrase)
                .then(isRequestable => response.setIsRequestable(isRequestable.isTrue));

            requestQueue.push(requestableFactory);

        }

        if (isNullOrUndefined(query) || query.events) {
            const myEvents = () => this.getCertificateTransferEvents(certificateId)
                .then(events => {
                    response.setEvents(events);
                });

            requestQueue.push(myEvents);
        }

        try {
            await Promise.all(requestQueue.map(request => request()));

        } catch (err) {
            console.error(err);
        }

        return response.build();
    }

    private customHydrateToken = async (data: {
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
            sameRequestOwnershipPassphrase !== undefined ? sameRequestOwnershipPassphrase : true;

        passphrase = passphrase || this.utils.createPassphrase();

        const temporaryWallet = this.servicesHub.walletFactory().fromPassPhrase(passphrase);

        console.assert(
            !(hash && content),
            "you should choose between hash and certificate"
        );
        console.assert(
            !(isNullOrUndefined(hash) && isNullOrUndefined(content)),
            "you should pass at least on parameter"
        );

        if (content) {
            const certificateSchema = await this.servicesHub.httpClient
                .fetch(content.$schema);

            hash = await this.utils.cert(certificateSchema, content);
        }

        return this.wallet.storeContract.methods
            .hydrateToken(
                certificateId,
                hash,
                uri,
                temporaryWallet.publicKey,
                tokenRecoveryTimestamp,
                sameRequestOwnershipPassphrase,
                this.wallet.brandDataHubRewardAddress
            )
            .send()
            .then(i => ({
                ...(<any>i),
                passphrase,
                certificateId: certificateId
            }));
    }

    private createCertificateRequestOwnershipLink = async (certificateId: number, passphrase?: string) => {
        if (!passphrase) {
            passphrase = this.utils.createPassphrase();
        }
        await this.setPassphrase(certificateId, passphrase, 1);

        return this.utils.createLink(certificateId, passphrase);
    }

    private createCertificateProofLink = async (certificateId: number, passphrase?: string) => {
        if (!passphrase) {
            passphrase = this.utils.createPassphrase();
        }
        await this.setPassphrase(certificateId, passphrase, 2);

        return this.utils.createLink(certificateId, passphrase, 'proof');
    }

    private async setPassphrase(certificateId: number, passphrase: string, type: number) {
        const temporaryWallet = this.servicesHub.walletFactory().fromPassPhrase(passphrase);

        return this.wallet
            .smartAssetContract
            .methods
            .addTokenAccess(certificateId, temporaryWallet.publicKey, true, type)
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
        const balance = await this.servicesHub.rawContracts.ariaContract.methods
            .balanceOf(this.wallet.publicKey)
            .call();

        return balance / 100000000;
    }

    private getCertificateTransferEvents = async (certificateId: CertificateId): Promise<any> => {
        const sortedEvents = await this.servicesHub.rawContracts.smartAssetContract.getPastEvents('Transfer',
            {filter: {_certificateId: certificateId}, fromBlock: 0, toBlock: 'latest'})
            .then(events => events.sort(sortEvents));

        return Promise.all(sortedEvents
            .map(event => this.identityService.getIdentity(event.returnValues._to)
                .then(identity => ({...event, identity: identity}))));
    }

    private isCertificateProofValid = async (certificateId: number, passphrase: string): Promise<ExtendedBoolean> => {
        return this.isProofValidSince(certificateId, passphrase, 2, 300);
    }

    private isProofValid = async (certificateId, passphrase, tokenType): Promise<boolean> => {
        const tokenHashedAccess = await this.wallet.smartAssetContract.methods
            .tokenHashedAccess(certificateId, tokenType)
            .call();

        const proof = this.servicesHub.walletFactory().fromPassPhrase(passphrase).publicKey;

        if (/^0x0+$/.test(tokenHashedAccess)) {
            return false;
        } else {
            return (proof === tokenHashedAccess);
        }
    }

    private isProofValidSince = (
        certificateId: number,
        passphrase: string,
        tokenType: number,
        validity: number
    ): Promise<ExtendedBoolean> => {
        return new Promise(async (resolve, reject) => {
            const tokenHashedAccess = await this.wallet.smartAssetContract.methods
                .tokenHashedAccess(certificateId, tokenType)
                .call();

            const proofValid = await this.isProofValid(certificateId, passphrase, tokenType);

            if (!proofValid) {
                return resolve({
                        isTrue: false,
                        code: 'proof.token.dontmatch',
                        message: 'token proof does not match'
                    }
                );
            }

            const events = await this.wallet.smartAssetContract
                .getPastEvents(blockchainEvent.smartAsset.tokenAccessAdded,
                    {
                        fromBlock: 0,
                        toBlock: "latest",
                        filter: {
                            _certificateId: certificateId,
                            _encryptedTokenKey: tokenHashedAccess,
                            _tokenType: tokenType
                        }
                    });

            events.sort(sortEvents).reverse();
            const lastEvent = events[0];
            const eventBlock = await this.servicesHub.web3.eth.getBlock(lastEvent.blockNumber);

            if (!this.utils.timestampIsMoreRecentThan(eventBlock.timestamp, validity)) {
                return resolve({isTrue: false, code: 'proof.token.tooold', message: 'token proof does not match'});
            }
            const lastEventTransaction = await this.servicesHub.web3.eth
                .getTransaction(lastEvent.transactionHash);

            const actualOwner = await this.wallet.smartAssetContract.methods.ownerOf(certificateId).call();
            if (lastEventTransaction.from != actualOwner) {
                return resolve({
                    isTrue: false,
                    code: 'proof.token.notowner',
                    message: 'token proof does not match'
                });
            }

            return resolve({isTrue: true, code: 'proof.token.valid', message: 'proof is valid'});
        });
    }

    private getCertificateArianeeEvents = async (certificateId: number, passphrase?: string): Promise<any[]> => {
        const sortedEvents = await this.servicesHub.rawContracts.eventContract.getPastEvents(
            blockchainEvent.arianeeEvent.eventCreated,
            {filter: {_certificateId: certificateId}, fromBlock: 0, toBlock: 'latest'}
        )
            .then(events => events.sort(sortEvents));

        if (sortedEvents.length > 0) {

            const issuerIdentity = await this.wallet.smartAssetContract.methods.issuerOf(certificateId).call()
                .then(async (issuer) => {
                    return await this.identityService.getIdentity(issuer);
                });

            return Promise.all(sortedEvents.map(async (event: any, index: number) => {
                let requestBody: any = {
                    eventId: parseInt(event.returnValues._eventId),
                    certificateId: parseInt(event.returnValues._certificateId)
                };

                let privateKey: string;
                if (passphrase) {
                    privateKey = this.servicesHub.walletFactory().fromPassPhrase(passphrase).privateKey;
                    requestBody.authentification = this.utils.signProofForRpc(certificateId, privateKey);
                } else {
                    privateKey = this.wallet.privateKey;
                    requestBody.authentification = this.utils.signProofForRpc(certificateId, privateKey);
                }
                console.log(issuerIdentity);

                return new Promise((resolve, reject) => {
                    this.servicesHub.RPC.withURI(issuerIdentity.data.rpcEndpoint).request(
                        'event.read',
                        requestBody,
                        function (err, error, result) {
                            if (result) {
                                event.data = result;
                            }
                            resolve(event);
                        }
                    );
                });
            }));
        }
    }

}
