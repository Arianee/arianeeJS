import {CertificateId} from '../../../models/CertificateId';
import {CertificateSummaryBuilder} from '../../certificateSummary';
import {ArianeeWallet} from '../wallet';
import {IdentityService} from "./identityService";

export class CertificateDetails {
    constructor(private wallet: ArianeeWallet, private identityService: IdentityService) {

    }

    public getOwnerFactory = (certificateId: CertificateId, certificateBuilder?: CertificateSummaryBuilder) => {
        return async () => {
            const owner = await this.wallet.smartAssetContract.methods
                .ownerOf(certificateId.toString())
                .call();

            if (certificateBuilder) certificateBuilder.setOwner(owner);

            return owner;
        };
    }

    private getCertificateContentFromHttp = async (certificateURI) => {

        return await this.wallet
            .servicesHub
            .httpClient
            .fetchWithCache(certificateURI);
    }

    private getCertificateContentFromRPC = async (certificateURI, certificateId, proof) => {

        const issuer = await this.wallet.smartAssetContract.methods.issuerOf(certificateId).call();
        const identity = await this.identityService.getIdentity(issuer);

        return this.wallet.servicesHub.httpClient.RPCCall(
            identity.data.rpcEndpoint,
            "certificate.read",
            {
                certificateId: certificateId,
                authentification: {
                    hash: proof.messageHash,
                    signature: proof.signature,
                    message: proof.message
                }
            });
    }

    private getCertificateContent = (certificateURI, certificateId, proof) => {
        return this.getCertificateContentFromRPC(certificateURI, certificateId, proof)
            .catch(err => this.getCertificateContentFromHttp(certificateURI));
    }

    public getContentFactory = (
        certificateId: CertificateId,
        passphrase?,
        certificateBuilder?: CertificateSummaryBuilder) => {
        return async () => {

            const tokenURI = await this.wallet.smartAssetContract.methods
                .tokenURI(certificateId.toString())
                .call();

            let proof;

            if (passphrase) {
                const temporaryWallet = this.wallet.servicesHub.walletFactory().fromPassPhrase(passphrase);
                proof = this.wallet.utils.signProof(
                    JSON.stringify({
                        certificateId: certificateId,
                        timestamp: new Date()
                    }),
                    temporaryWallet.privateKey
                );
            } else {
                proof = this.wallet.utils.signProof(
                    JSON.stringify({
                        certificateId: certificateId,
                        timestamp: new Date()
                    }),
                    this.wallet.privateKey
                );
            }

            const certificateContentData: any = await this.getCertificateContent(tokenURI, certificateId, proof);

            const certificateSchema = await this.wallet.servicesHub.httpClient
                .fetch(certificateContentData.$schema);

            const hash = await this.wallet.utils.cert(
                certificateSchema,
                certificateContentData
            );

            const tokenImprint = await this.wallet.smartAssetContract.methods
                .tokenImprint(certificateId.toString())
                .call();

            const isCertificateContentValid = hash === tokenImprint;

            if (certificateBuilder) certificateBuilder.setContent(certificateContentData, isCertificateContentValid);

            return certificateContentData;
        };
    }
}
