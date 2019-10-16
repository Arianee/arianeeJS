import { TokenId } from '../../../models/TokenId';
import { CertificateSummaryBuilder } from '../../certificateSummary';
import { ArianeeWallet } from '../wallet';
import {IdentityService} from "./identityService";

export class CertificateDetails {
    constructor(private wallet: ArianeeWallet, private identityService:IdentityService) {

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

        const issuer = await this.wallet.smartAssetContract.methods.issuerOf(tokenId).call();
        const identity = await this.identityService.getIdentity(issuer);

        return this.wallet.servicesHub.httpClient.RPCCall(
          identity.data.rpcEndpoint,
          "certificate.read",
          {
            tokenId: tokenId,
            authentification: {
              hash: proof.messageHash,
              signature: proof.signature,
              message: proof.message
            }
          });
    }

    private getCertificateContent = (tokenURI, tokenId, proof) => {
        return this.getCertificateContentFromRPC(tokenURI, tokenId, proof)
            .catch(err => this.getCertificateContentFromHttp(tokenURI));
    }

    public getContentFactory = (
        tokenId: TokenId,
        passphrase?,
        certificateBuilder?: CertificateSummaryBuilder) => {
        return async () => {

            const tokenURI = await this.wallet.smartAssetContract.methods
                .tokenURI(tokenId.toString())
                .call();

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
        };
    }
}
