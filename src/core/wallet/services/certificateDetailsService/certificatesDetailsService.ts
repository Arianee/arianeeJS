import { cloneDeep, get, orderBy } from 'lodash';
import { injectable } from 'tsyringe';
import { ArianeeGateWayAuthentification } from '../../../../models/ArianeeGateWayAuthentification';
import { ArianeeTokenId } from '../../../../models/ArianeeTokenId';
import { ArianeeCertificatei18nV3 } from '../../../../models/jsonSchema/certificates/ArianeeProducti18n';
import { StoreNamespace } from '../../../../models/storeNamespace';
import { ArianeeHttpClient } from '../../../libs/arianeeHttpClient/arianeeHttpClient';
import { certificateParentMerger } from '../../../libs/certificateParentMerger/certificateParentMerger';
import { isSchemai18n } from '../../../libs/certificateVersion';
import { deepFreeze } from '../../../libs/deepFreeze';
import { hasParentCertificate } from '../../../libs/hasParentCertificates';
import { replaceLanguageContentWithFavUserLanguage } from '../../../libs/i18nSchemaLanguageManager/i18nSchemaLanguageManager';
import { SimpleStore } from '../../../libs/simpleStore/simpleStore';
import { CertificateSummaryBuilder } from '../../certificateSummary';
import {
  CertificateContentContainer,
  ConsolidatedCertificateRequest,
  ConsolidatedIssuerRequestInterface
} from '../../certificateSummary/certificateSummary';
import { ArianeeAuthentificationService } from '../arianeeAuthentificationService/arianeeAuthentificationService';
import { ConfigurationService } from '../configurationService/configurationService';
import { ContractService } from '../contractService/contractsService';
import { GlobalConfigurationService } from '../globalConfigurationService/globalConfigurationService';
import { IdentityService } from '../identityService/identityService';
import { UtilsService } from '../utilService/utilsService';
import { WalletService } from '../walletService/walletService';

@injectable()
export class CertificateDetails {
  constructor (
    private identityService: IdentityService,
    private httpClient: ArianeeHttpClient,
    private contractService: ContractService,
    private configurationService: ConfigurationService,
    private walletService: WalletService,
    private utils: UtilsService,
    private store: SimpleStore,
    private arianeeAuthentificationService:ArianeeAuthentificationService,
    private globalConfigurationService:GlobalConfigurationService
  ) {
  }

  public getCertificateIssuer = async (parameters:{certificateId: ArianeeTokenId, query: ConsolidatedCertificateRequest}) => {
    return this.fetchCertificateIssuer(parameters);
  }

  public fetchCertificateIssuer = async (
    parameters:{certificateId: ArianeeTokenId, query: ConsolidatedCertificateRequest}) => {
    const { certificateId } = parameters;

    const issuerOf = () => this.contractService.smartAssetContract.methods
      .issuerOf(certificateId.toString())
      .call();

    const address = await this.store.get<string>(StoreNamespace.certificateIssuer, certificateId, issuerOf);

    return this.identityService.getIdentity({
      ...parameters,
      address
    });
  }

  public getCertificateOwner = async (
    certificateId: ArianeeTokenId,
    certificateBuilder?: CertificateSummaryBuilder
  ) => {
    const owner = await this.contractService.smartAssetContract.methods
      .ownerOf(certificateId.toString())
      .call();

    if (certificateBuilder) certificateBuilder.setOwner(owner, this.walletService.address);

    return owner;
  }

  private getCertificateContentFromHttp = async certificateURI => {
    return this.httpClient.fetch(
      certificateURI
    );
  }

  private updateCertificateContentReadRPC = async (parameters: { certificateId:string,
      rpcEndPoint: string,
      arianeeRPCAuthentification: ArianeeGateWayAuthentification }) => {
    const { rpcEndPoint, arianeeRPCAuthentification, certificateId } = parameters;

    return this.httpClient.RPCCall<CertificateContentContainer>(
      rpcEndPoint,
      'update.read',
      {
        certificateId: certificateId,
        authentification: arianeeRPCAuthentification
      }
    );
  };

  private originalCertificateContentReadRPC = async (parameters: { certificateId:string,
      rpcEndPoint: string,
      arianeeRPCAuthentification: ArianeeGateWayAuthentification }) => {
    const { rpcEndPoint, arianeeRPCAuthentification, certificateId } = parameters;

    return this.httpClient.RPCCall<CertificateContentContainer>(
      rpcEndPoint,
      'certificate.read',
      {
        certificateId: certificateId,
        authentification: arianeeRPCAuthentification
      }
    );
  };

  private getCertificateContentFromRPC = async (
    parameters:{
      certificateURI: string, certificateId: string, arianeeRPCAuthentification: ArianeeGateWayAuthentification, query: ConsolidatedCertificateRequest
    }
  ) => {
    const { certificateId, query, arianeeRPCAuthentification } = parameters;
    const issuer = query.issuer as ConsolidatedIssuerRequestInterface;

    let rpcEndPoint;
    if (issuer.rpcURI) {
      rpcEndPoint = issuer.rpcURI;
    } else {
      const address = await this.contractService.smartAssetContract.methods
        .issuerOf(certificateId)
        .call();

      const identity = await this.identityService.getIdentity({
        ...parameters,
        address
      })
        .then(d => {
          if (d.data === undefined) {
            console.warn(`# ${parameters.certificateURI} # failing to retrieve identity`);
          };
          return d;
        });

      rpcEndPoint = identity.data.rpcEndpoint;
    }

    const rpcConfig = {
      certificateId,
      arianeeRPCAuthentification,
      rpcEndPoint
    };
    const certificateRPCResult = await this.updateCertificateContentReadRPC(rpcConfig)
      .catch(error => {
        return this.originalCertificateContentReadRPC(rpcConfig);
      });

    return certificateRPCResult.result;
  }

  private getContent = (parameters:{
    certificateURI:string, certificateId:string, arianeeRPCAuthentification:any, query:ConsolidatedCertificateRequest
  }) => {
    const { certificateURI, certificateId } = parameters;
    return this.getCertificateContentFromRPC(parameters)
      .catch(err => {
        console.warn(`# ${certificateId} # Impossible to fetch content from RPC server`);
        console.warn(`# ${certificateId} # Fallback to simple http call ${certificateURI}`);

        return this.getCertificateContentFromHttp(parameters.certificateURI);
      })
      .catch(d => console.warn(`# ${certificateId} # Impossible to fetch content of this certificate ${parameters.certificateId}`));
  }

  public getCertificateContent = (
    parameters:{
      certificateId: ArianeeTokenId,
      passphrase?:string,
      query:ConsolidatedCertificateRequest
    }
  ): Promise<CertificateContentContainer> => {
    const { certificateId, query } = parameters;
    const { content } = this.globalConfigurationService.getMergedQuery(query);
    const { forceRefresh } = content as ConsolidatedIssuerRequestInterface;
    return this.store.get<CertificateContentContainer>(StoreNamespace.certificateContent, certificateId, () => this.getCertificateAndParentCertificate(parameters), forceRefresh);
  };

  public getCertificateAndParentCertificate = async (
    parameters: {
        certificateId: ArianeeTokenId,
        passphrase?: string,
        query: ConsolidatedCertificateRequest
      }
  ): Promise<CertificateContentContainer> => {
    const { query } = parameters;
    const certificateContentSummary = await this.fetchCertificateContent(parameters);
    if (hasParentCertificate(certificateContentSummary.raw)) {
      const certificateContentSummaryWithParents: ArianeeCertificatei18nV3 = certificateContentSummary.raw as ArianeeCertificatei18nV3;
      const parentCertificates = certificateContentSummaryWithParents.parentCertificates;
      const sortedParentLinks = orderBy(parentCertificates, ['type'], ['asc']);
      const parentLinks = sortedParentLinks.map(d => d.arianeeLink)
        .map(arianeeLink => this.arianeeAuthentificationService.extractParametersFromArianeeLink(arianeeLink));

      const $fetchingParents = parentLinks.map(link => {
        return this.getCertificateContent({
          certificateId: link.certificateId,
          passphrase: link.authentification,
          query
        });
      });

      const parentCertificateSummary = await Promise.all($fetchingParents);
      const parentCertificateContent = parentCertificateSummary.map(summary => summary.data);

      const parentAuthenticity = parentCertificateSummary.map(d => d.isAuthentic);
      // should not have unauthentic content
      const isAuthentic = ![certificateContentSummary.isAuthentic, ...parentAuthenticity]
        .includes(false);

      return {
        ...certificateContentSummary,
        isAuthentic,
        parents: parentCertificateSummary,
        isRawAuthentic: certificateContentSummary.isAuthentic,
        data: certificateParentMerger([...parentCertificateContent, certificateContentSummary.data])
      };
    }

    return certificateContentSummary;
  };

  private fetchCertificateContent = async (
    parameters:{ certificateId: ArianeeTokenId,
        passphrase?:string,
        query:ConsolidatedCertificateRequest}
  ): Promise<CertificateContentContainer> => {
    if (parameters.passphrase === undefined &&
        get(parameters, 'query.advanced.arianeeProofToken')) {
      parameters.passphrase = parameters.query.advanced.arianeeProofToken;
    }

    const { certificateId, passphrase, query } = parameters;

    const tokenURI = await this.contractService.smartAssetContract.methods
      .tokenURI(certificateId.toString())
      .call();

    const certificateContentData: any = await this.getContent(
      {
        ...parameters,
        arianeeRPCAuthentification: await this.arianeeAuthentificationService
          .generateAuthentificationHeader(certificateId, passphrase),
        certificateURI: tokenURI
      }
    );

    const certificateSchema = await this.httpClient.fetch(
      certificateContentData.$schema
    );

    const hash = await this.utils.cert(
      certificateSchema,
      certificateContentData
    );

    let tokenImprint;
    if (this.contractService.updateSmartAssetContract) {
      tokenImprint = await this.contractService.updateSmartAssetContract.methods
        .getImprint(certificateId.toString())
        .call();
    } else {
      tokenImprint = await this.contractService.smartAssetContract
        .methods
        .tokenImprint(certificateId.toString())
        .call();
    }

    const isCertificateContentValid = hash === tokenImprint;

    const certificateSummary:CertificateContentContainer = {
      imprint: tokenImprint,
      data: certificateContentData,
      isRawAuthentic: isCertificateContentValid,
      isAuthentic: isCertificateContentValid,
      raw: deepFreeze(cloneDeep(certificateContentData))
    };

    if (get(query, 'advanced.languages') &&
        get(certificateSummary, 'content.data') &&
        isSchemai18n(certificateContentData)) {
      certificateSummary.data = replaceLanguageContentWithFavUserLanguage(certificateContentData, query.advanced.languages) as any;
    }
    return certificateSummary;
  }
}
