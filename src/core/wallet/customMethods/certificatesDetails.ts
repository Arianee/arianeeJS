import { TokenId } from '../../../models/TokenId';
import { CertificateSummaryBuilder } from '../../certificateSummary';
import { ArianeeWallet } from '../wallet';

export class CertificateDetails {
    constructor(private wallet: ArianeeWallet) {

    }

    public getOwnerFactory = (tokenId: TokenId, certificateBuilder?: CertificateSummaryBuilder) => {
        return async () => {
            const owner = await this.wallet.smartAssetContract.methods
                .ownerOf(tokenId.toString())
                .call();

            if (certificateBuilder) certificateBuilder.setOwner(owner);

            return owner;
        };
    }

    private getCertificateContentFromHttp = async (tokenURI) => {

        return await this.wallet
            .servicesHub
            .httpClient
            .fetchWithCache(tokenURI);
    }

    private getCertificateContentFromRPC = async (tokenURI, tokenId, proof) => {
        return new Promise(
            (resolve, reject) => {
                this.wallet.servicesHub.RPC.withURI(tokenURI).request(
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
    }

    private getCertificateContent = (tokenURI, tokenId, proof) => {
        return this.getCertificateContentFromRPC(tokenURI, tokenId, proof)
            .catch(err => this.getCertificateContentFromHttp(tokenURI))
    }

    public getContentFactory = (
        tokenId: TokenId,
        passphrase?,
        certificateBuilder?: CertificateSummaryBuilder) => {
        return async () => {

            const tokenURI = await this.wallet.smartAssetContract.methods
                .tokenURI(tokenId.toString())
                .call();
            console.log(tokenURI);

            let proof;

            if (passphrase) {
                const temporaryWallet = this.wallet.servicesHub.walletFactory().fromPassPhrase(passphrase);
                proof = this.wallet.utils.signProof(
                    JSON.stringify({
                        tokenId: tokenId,
                        timestamp: new Date()
                    }),
                    temporaryWallet.privateKey
                );
            } else {
                proof = this.wallet.utils.signProof(
                    JSON.stringify({
                        tokenId: tokenId,
                        timestamp: new Date()
                    }),
                    this.wallet.privateKey
                );
            }

            const certificateContentData: any = await this.getCertificateContent(tokenURI, tokenId, proof);

            const certificateSchema = await this.wallet.servicesHub.httpClient
                .fetch(certificateContentData.$schema);

            const hash = await this.wallet.utils.cert(
                certificateSchema,
                certificateContentData
            );

            const tokenImprint = await this.wallet.smartAssetContract.methods
                .tokenImprint(tokenId.toString())
                .call();

            const isCertificateContentValid = hash === tokenImprint;


            if (certificateBuilder) certificateBuilder.setContent(certificateContentData, isCertificateContentValid);

            return certificateContentData;
        }
    }
}
