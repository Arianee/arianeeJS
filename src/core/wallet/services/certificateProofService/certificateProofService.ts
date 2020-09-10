import appendQuery from 'append-query';
import { injectable } from 'tsyringe';
import { ArianeeTokenId } from '../../../../models/ArianeeTokenId';
import { BlockchainEvent } from '../../../../models/blockchainEvent';
import { blockchainEventsName } from '../../../../models/blockchainEventsName';
import { ExtendedBoolean } from '../../../../models/extendedBoolean';
import { QueryAndSearchParams } from '../../../../models/queryAndSearchParams.enum';
import { ArianeeHttpClient } from '../../../libs/arianeeHttpClient/arianeeHttpClient';
import { sortEvents } from '../../../libs/sortEvents';
import { ArianeeAccessTokenService } from '../ArianeeAccessToken/ArianeeAccessTokenService';
import { ConfigurationService } from '../configurationService/configurationService';
import { ContractService } from '../contractService/contractsService';
import { IdentityService } from '../identityService/identityService';
import { UtilsService } from '../utilService/utilsService';
import { WalletService } from '../walletService/walletService';
import { Web3Service } from '../web3Service/web3Service';
import { get } from 'lodash';

@injectable()
export class CertificateProofService {
  constructor (
    private contractService: ContractService,
    private configurationService: ConfigurationService,
    private arianeeAccessTokenService:ArianeeAccessTokenService,
    private walletService: WalletService,
    private web3Service:Web3Service,
    private utils: UtilsService) {

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
      .addTokenAccess(certificateId, temporaryWallet.address, true, type)
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

  /**
   * Create an actionProofLink. It appends encode RFC 3986 query param proof link to provided url
   * @param url
   * @param certificateId
   * @param passphrase
   * @return url
   */
  public createActionProofLink=async (url:string, certificateId: number, passphrase?: string):Promise<string> => {
    if (!passphrase) {
      passphrase = this.utils.createPassphrase();
    }

    const { link } = await this.createCertificateProofLink(certificateId, passphrase);

    return appendQuery(url, { proofLink: link });
  }

  public createAuthURL=(data:{type:'proof'|'arianeeAccessToken', certificateId:ArianeeTokenId, url:string}):Promise<string> => {
    const { type, certificateId, url } = data;
    if (type === 'proof') {
      return this.createActionProofLink(url, certificateId);
    } else if (type === 'arianeeAccessToken') {
      return Promise.resolve(this.arianeeAccessTokenService.createActionArianeeAccessTokenLink(url, certificateId));
    } else {
      throw new Error(`this type ${type} is not supported`);
    }
  }

  public isAuthURL = async (url: string):Promise<ExtendedBoolean> => {
    const d = this.utils.simplifiedParsedURL(url);
    const regex = `${QueryAndSearchParams.proofLink}=([^&]*)`;
    const matches = d.search.match(regex);
    const arianeeJWT = new URL(url).searchParams.get(QueryAndSearchParams.arianeeAccessToken);

    if (matches) {
      const link = matches[1];
      return this.isCertificateProofValidFromLink(link);
    }

    if (arianeeJWT) {
      const jwt = this.arianeeAccessTokenService.decodeArianeeAccessToken(arianeeJWT);
      const certificateId = get(jwt, 'payload.subId');
      return this.isJwtProofValid(certificateId, arianeeJWT);
    }

    throw new Error(`this is not a AuthUrl ${url}`);
  } ;

  public isCertificateProofValidFromLink = async (proofLink: string) => {
    const decodedURI = decodeURIComponent(proofLink);
    const { passphrase, certificateId } = this.utils.readLink(decodedURI);

    return this.isCertificateProofValid(certificateId, passphrase);
  };

  public isCertificateProofValid = async (
    certificateId: number,
    passphrase?: string,
    jwt?:string
  ): Promise<ExtendedBoolean<{timestamp?:number}>> => {
    if (passphrase) {
      return this.isProofValidSince(certificateId, passphrase, 2, 300);
    }

    if (jwt) {
      return this.isJwtProofValid(certificateId, jwt);
    }
  }

  private isJwtProofValid = async (certificateId, jwt):Promise<ExtendedBoolean<{timestamp?:number, certificateId:ArianeeTokenId}>> => {
    const isJWTValid = await this.arianeeAccessTokenService.isCertificateArianeeAccessTokenValid(jwt);
    const { payload } = this.arianeeAccessTokenService.decodeArianeeAccessToken(jwt);
    if (isJWTValid && (payload.subId === certificateId)) {
      return {
        isTrue: true,
        code: 'proof.token.valid',
        message: 'proof is valid',
        timestamp: payload.iat,
        certificateId: certificateId
      };
    } else {
      return {
        isTrue: false,
        code: 'proof.token.dontmatch',
        message: 'token proof does not match or is expired',
        timestamp: payload.iat,
        certificateId: certificateId
      };
    }
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
      .address;
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
  ): Promise<ExtendedBoolean<{timestamp?:number}>> => {
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

    const currentBlock = await this.web3Service.web3.eth.getBlockNumber();

    let events: BlockchainEvent[] = await this.contractService.smartAssetContract.getPastEvents(
      blockchainEventsName.smartAsset.tokenAccessAdded,
      {
        fromBlock: currentBlock - Math.round(validity / 5 + 30),
        toBlock: currentBlock
      }
    );

    events = events.filter(event => {
      return event.returnValues._tokenId === certificateId.toString() &&
          event.returnValues._tokenType === tokenType.toString() &&
          event.returnValues._encryptedTokenKey === tokenHashedAccess &&
          event.returnValues._enable === true;
    }).sort(sortEvents).reverse();

    const lastEvent = events[0];
    let blockTimestamp = 0;

    if (lastEvent) {
      blockTimestamp = await this.utils.getTimestampFromBlock(lastEvent.blockNumber);
    }

    if (
      !this.utils.timestampIsMoreRecentThan(blockTimestamp, validity)
    ) {
      return {
        isTrue: false,
        code: 'proof.token.tooold',
        message: 'token proof is too old',
        timestamp: blockTimestamp * 1000
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
        message: 'token proof is not the owner',
        timestamp: blockTimestamp * 1000
      };
    }

    return {
      isTrue: true,
      code: 'proof.token.valid',
      message: 'proof is valid',
      timestamp: blockTimestamp * 1000
    };
  }
}
