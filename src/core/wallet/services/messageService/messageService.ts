import { get, range } from 'lodash';
import { injectable } from 'tsyringe';
import { ExtendedBoolean } from '../../../../models/extendedBoolean';
import { ArianeeHttpClient } from '../../../libs/arianeeHttpClient/arianeeHttpClient';
import { isNullOrUndefined } from '../../../libs/isNullOrUndefined';
import { ConsolidatedCertificateRequest, Message } from '../../certificateSummary/certificateSummary';
import { ConfigurationService } from '../configurationService/configurationService';
import { ContractService } from '../contractService/contractsService';
import { DiagnosisService } from '../diagnosisService/diagnosisService';
import { IdentityService } from '../identityService/identityService';
import { UtilsService } from '../utilService/utilsService';
import { WalletService } from '../walletService/walletService';
import { IdentitySummary } from '../../../../models/arianee-identity';
import { StoreNamespace } from '../../../../models/storeNamespace';
import { SimpleStore } from '../../../libs/simpleStore/simpleStore';

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
    private store: SimpleStore
  ) {
  }

  public getMessage=async (parameters:{
    messageId: number,
    query?:ConsolidatedCertificateRequest,
    url?:string,
    forceRefresh?:boolean
  }):Promise<Message> => {
    const forceRefresh = parameters.forceRefresh || false;

    return this.store.get<Message>(StoreNamespace.messages, parameters.messageId, () => this.fetchMessage(parameters), forceRefresh)
      .catch(d => d);
  }

  public fetchMessage=async (parameters:{
        messageId: number,
        query?:ConsolidatedCertificateRequest,
        url?:string
      }):Promise<Message> => {
    const { messageId, query } = parameters;
    const result = await this.contractService.messageContract.methods.messages(messageId).call();

    const issuer = await this.identityService.getIdentity({ address: result.sender, query });
    let content;
    const rpcURL = get(issuer, 'data.rpcURI') || parameters.url;
    if (rpcURL) {
      const proof = this.utils.signProof(
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

    const messageReadEvents = await this.contractService.messageContract.getPastEvents(
      'MessageRead',
      { fromBlock: 0, toBlock: 'latest', filter: { _messageId: messageId } }
    );

    const isRead = messageReadEvents.length > 0;

    return {
      certificateId: result.tokenId,
      issuer: {
        isIdentityVerified: issuer.isApproved,
        isIdentityAuthentic: issuer.isAuthentic,
        imprint: issuer.imprint,
        identity: issuer.data
      },
      content,
      to: result.to,
      messageId,
      timestamp: creationDate,
      isRead: isRead

    };
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

    try {
      // Not necessary. It never throws. To update when reward getter become public
      await this.contractService.storeContract.methods.readMessage(messageId, walletReward).call();
      await this.contractService.storeContract.methods.readMessage(messageId, walletReward).send();
      await this.getMessage({ messageId: messageId, forceRefresh: true });

      return {
        isTrue: true,
        code: 'message.markasread',
        message: 'message was mark as read'
      };
    } catch (err) {
      return {
        isTrue: false,
        code: 'message.markasread',
        message: 'message was already mark as read or cant be mark as read'
      };
    }
  }

  public isMessageRead=async (
    messageId?: number
  ):Promise<boolean> => {
    // work in progress
    return true;
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
  }, url:string) => {
    const result = await this.createMessage(data);
    await this.storeMessageContentInRPCServer(result.messageId, data.content, url);

    return result;
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
    let { certificateId, contentImprint, content } = data;
    const brandReward = this.configurationService.arianeeConfiguration.brandDataHubReward.address;

    const messageId = data.messageId || this.utils.createUID();

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
        this.diagnosisService.isMessageCredit()
      ]);
      return Promise.reject(diagnosis);
    }
  }
}
