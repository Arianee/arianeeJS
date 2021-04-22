import { get, range } from 'lodash';
import { injectable } from 'tsyringe';
import { ExtendedBoolean } from '../../../../models/extendedBoolean';
import { StoreNamespace } from '../../../../models/storeNamespace';
import { ArianeeHttpClient } from '../../../libs/arianeeHttpClient/arianeeHttpClient';
import { isSchemai18n } from '../../../libs/certificateVersion';
import { replaceLanguage } from '../../../libs/i18nSchemaLanguageManager/i18nSchemaLanguageManager';
import { isNullOrUndefined } from '../../../libs/isNullOrUndefined';
import { SimpleStore } from '../../../libs/simpleStore/simpleStore';
import { ConsolidatedCertificateRequest, Message } from '../../certificateSummary/certificateSummary';
import { CertificateService } from '../certificateService/certificateService';
import { ConfigurationService } from '../configurationService/configurationService';
import { ContractService } from '../contractService/contractsService';
import { DiagnosisService } from '../diagnosisService/diagnosisService';
import { IdentityService } from '../identityService/identityService';
import { UtilsService } from '../utilService/utilsService';
import { WalletService } from '../walletService/walletService';

@injectable()
export class MessageService {
  constructor (
    private identityService: IdentityService,
    private contractService: ContractService,
    private walletService: WalletService,
    private configurationService: ConfigurationService,
    private httpClient: ArianeeHttpClient,
    private utils: UtilsService,
    private diagnosisService:DiagnosisService,
    private store: SimpleStore,
    private certificateService: CertificateService
  ) {
  }

  public getMessage=async (parameters:{
    messageId: number,
    query?:ConsolidatedCertificateRequest,
    url?:string,
    forceRefresh?:boolean
  }):Promise<Message> => {
    const forceRefresh = parameters.forceRefresh || false;

    return this.store.get<Message>(StoreNamespace.messages, parameters.messageId, () => this.fetchMessage(parameters), forceRefresh);
  }

  /**
   * Fetch message and apply i18n
   * @param {{messageId: number; query?: ConsolidatedCertificateRequest; url?: string}} parameters
   * @returns {Promise<Message>}
   */
  public fetchMessage=async (parameters:{
    messageId: number,
    query?: ConsolidatedCertificateRequest,
    url?: string
  }): Promise<Message> => {
    const { query } = parameters;
    let messageSummary = await this.fetchRawMessage(parameters);

    if (get(query, 'advanced.languages') &&
        get(messageSummary.content, 'data') &&
        isSchemai18n(messageSummary.content.data)) {
      messageSummary = replaceLanguage(messageSummary, query.advanced.languages) as any;
    }

    return messageSummary;
  };

  /**
   * Fetch message
   * @param {{messageId: number; query?: ConsolidatedCertificateRequest; url?: string}} parameters
   * @returns {Promise<Message>}
   */
  public fetchRawMessage = async (parameters: {
    messageId: number,
    query?: ConsolidatedCertificateRequest,
    url?: string
  }): Promise<Message> => {
    const { messageId, query } = parameters;
    const result = await this.contractService.messageContract.methods.messages(messageId).call();
    const certificateIdentityIssuer = await this.certificateService.getCertificate(result.tokenId, '', {
      issuer: true,
      content: false
    });

    const certificateIssuer = certificateIdentityIssuer.issuer.identity;

    const messageIdentityIssuer = await this.identityService.getIdentity({ address: result.sender });

    let content;
    const rpcURL = get(certificateIssuer, 'data.rpcEndpoint') || parameters.url;
    if (rpcURL) {
      const proof = await this.walletService.signProof(
        JSON.stringify({
          messageId,
          timestamp: new Date()
        }),
        this.walletService.privateKey
      );

      const messageRPCResult = await this.httpClient.RPCCall(
        rpcURL,
        'message.read',
        {
          messageId,
          authentification: {
            hash: proof.messageHash,
            signature: proof.signature,
            message: proof.message
          }
        }
      );
      const messageContent = messageRPCResult.result;
      if (messageContent) {
        const messageSchema = await this.httpClient.fetch(messageContent.$schema);

        const hash = await this.utils.cert(
          messageSchema,
          messageContent
        );

        const isMessageAuthentic = hash === result.imprint;

        content = {
          data: messageContent,
          imprint: result.imprint,
          isAuthentic: isMessageAuthentic
        };
      }
    }

    const messageSentEvents = await this.contractService.messageContract.getPastEvents(
      'MessageSent',
      { fromBlock: 0, toBlock: 'latest', filter: { _tokenId: result.tokenId } }
    );

    const messageCreationEvent = messageSentEvents.find(event => event.returnValues._messageId === messageId.toString());
    let creationDate = await this.utils.getTimestampFromBlock(messageCreationEvent.blockNumber);
    creationDate = parseInt(creationDate) * 1000;

    const isRead = await this.isMessageRead(messageId);

    let messageSummary = {
      certificateId: result.tokenId,
      to: result.to,
      from: result.sender,
      messageId,
      issuer: {
        isIdentityVerified: messageIdentityIssuer.isApproved,
        isIdentityAuthentic: messageIdentityIssuer.isAuthentic,
        imprint: messageIdentityIssuer.imprint,
        identity: messageIdentityIssuer
      },
      content,

      timestamp: creationDate,
      isRead: isRead

    };
    if (get(query, 'advanced.languages') &&
        get(content, 'data') &&
        isSchemai18n(content.data)) {
      messageSummary = replaceLanguage(messageSummary, query.advanced.languages) as any;
    }

    return messageSummary;
  }

  public getMyMessages=async (parameters?:{
    query?:ConsolidatedCertificateRequest,
    url?:string
  }) => {
    const nbMessages = await this.contractService.messageContract.methods.messageLengthByReceiver(this.walletService.address).call();

    const rangeOfMessage = range(0, +nbMessages);

    const messageIds = await Promise.all(rangeOfMessage
      .map(index => this.contractService.messageContract.methods.receiverToMessageIds(this.walletService.address, index)
        .call()));

    return Promise.all(messageIds.map(messageId => {
      return this.getMessage({ messageId: <unknown>messageId as number, ...parameters })
        .catch(d => undefined);
    }
    ));
  }

  public markAsRead=async (
    messageId: number
  ):Promise<ExtendedBoolean> => {
    const walletReward = this.configurationService.arianeeConfiguration.walletReward.address;

    const isAlreadyRead = await this.isMessageRead(messageId);

    if (isAlreadyRead) {
      return {
        isTrue: false,
        code: 'message.markasread',
        message: 'message was already mark as read or cant be mark as read'
      };
    } else {
      await this.contractService.storeContract.methods.readMessage(messageId, walletReward).send();
      await this.getMessage({ messageId: messageId, forceRefresh: true });

      return {
        isTrue: true,
        code: 'message.markasread',
        message: 'message was mark as read'
      };
    }
  }

  public isMessageRead=async (
    messageId?: number
  ):Promise<boolean> => {
    const messageReadEvents = await this.contractService.messageContract.getPastEvents(
      'MessageRead',
      { fromBlock: 0, toBlock: 'latest', filter: { _messageId: messageId } }
    );

    return messageReadEvents.length > 0;
  }

  public storeMessageContentInRPCServer =async (
    messageId:number,
    content,
    url:string) => {
    return this.httpClient.RPCCall(url, 'message.create', {
      messageId,
      json: content
    });
  }

  public createAndStoreMessage=async (data: {
    uri?: string;
    certificateId: number,
    content?: { $schema: string;[key: string]: any };
      messageId?: number;
  }, url?:string) => {
    if (!url) {
      const certificateIssuerAddress = await this.contractService.smartAssetContract.methods.issuerOf(data.certificateId).call();
      const issuerIdentity = await this.identityService.getIdentity({ address: certificateIssuerAddress, query: { issuer: true } });
      url = issuerIdentity.data.rpcEndpoint;
    }

    const result = await this.createMessage(data);
    await this.storeMessageContentInRPCServer(result.messageId, data.content, url);

    return result;
  }

  generateAvailableMessageId= async ():Promise<number> => {
    const messageId = this.utils.createUID();

    const isFree = this.isMessageIdFree(messageId);

    if (isFree) {
      return messageId;
    } else {
      return this.generateAvailableMessageId();
    }
  }

  private isMessageIdFree = async (arianeeEventId:number):Promise<boolean> => {
    const message = await this.contractService.messageContract.methods.messages(arianeeEventId).call();

    return message.sender === '0x0000000000000000000000000000000000000000';
  }

  public createMessage=async (data: {
    contentImprint?: string;
    certificateId: number,
    content?: { $schema: string;[key: string]: any };
    messageId?: number;

  }):Promise<
      { contentImprint: string,
       messageId: number}
    > => {
    let { messageId, certificateId, contentImprint, content } = data;
    const brandReward = this.configurationService.arianeeConfiguration.brandDataHubReward.address;

    if (data.messageId) {
      const arianeeEventIdIsAvailable = await this.isMessageIdFree(messageId);

      if (!arianeeEventIdIsAvailable) {
        throw new Error(`Message id (${messageId}) is not available`);
      }
    } else {
      messageId = await this.generateAvailableMessageId();
    }

    console.assert(
      !(contentImprint && content),
      'you should choose between contentImprint parameter and content contentImprint'
    );

    console.assert(
      !(isNullOrUndefined(contentImprint) && isNullOrUndefined(content)),
      'you should pass at least on parameter'
    );

    if (content) {
      const messageSchema = await this.httpClient.fetch(
        content.$schema
      );

      contentImprint = await this.utils.cert(messageSchema, content);
    }

    try {
      const result = await this.contractService.storeContract.methods.createMessage(messageId, certificateId, contentImprint, brandReward).send();

      return {
        store: this.storeMessageContentInRPCServer,
        ...result,
        contentImprint,
        messageId
      };
    } catch (e) {
      const diagnosis = await this.diagnosisService.diagnosis([
        this.diagnosisService.isStoreApprove(),
        this.diagnosisService.isMessageCredit(),
        this.diagnosisService.isWhiteListed(certificateId)
      ], e);
      return Promise.reject(diagnosis);
    }
  }
}
