import { get } from 'lodash';
import { injectable } from 'tsyringe';
import { ArianeeTokenId } from '../../../../models/ArianeeTokenId';
import { BlockchainEvent, EventContent } from '../../../../models/blockchainEvent';
import { blockchainEventsName } from '../../../../models/blockchainEventsName';
import { ArianeeHttpClient } from '../../../libs/arianeeHttpClient/arianeeHttpClient';
import { isCertificateI18n } from '../../../libs/certificateVersion';
import { replaceLanguage } from '../../../libs/i18nSchemaLanguageManager/i18nSchemaLanguageManager';
import { isNullOrUndefined } from '../../../libs/isNullOrUndefined';
import { sortEvents } from '../../../libs/sortEvents';
import { ArianeeEvent, ConsolidatedCertificateRequest } from '../../certificateSummary/certificateSummary';
import { ConfigurationService } from '../configurationService/configurationService';
import { ContractService } from '../contractService/contractsService';
import { DiagnosisService } from '../diagnosisService/diagnosisService';
import { IdentityService } from '../identityService/identityService';
import { UtilsService } from '../utilService/utilsService';
import { WalletService } from '../walletService/walletService';
import { ExtendedBoolean } from '../../../../models/extendedBoolean';


@injectable()
export class MessageService {
  constructor (
    private identityService: IdentityService,
    private contractService: ContractService,
    private walletService: WalletService,
    private configurationService: ConfigurationService,
    private httpClient: ArianeeHttpClient,
    private utils: UtilsService,
    private diagnosisService:DiagnosisService
  ) {
  }

  public getMyMessages=async ():Promise<
    {
        messageId: number,
        contentImprint: string,
        sender: string,
        to: string
    }[]
    > => {

    const nbMessages = await this.contractService.messageContract.methods.messageLengthByReceiver(this.walletService.address).call();

    let result: {
        messageId: number,
        contentImprint: string,
        sender: string,
        to: string
        }[] = [];
    const messageIdsPromise = [];
    for (let i = 0; i < <any>nbMessages ; i++) {
        messageIdsPromise.push(this.contractService.messageContract.methods.receiverToMessageIds(this.walletService.address,i).call());
    }
    const messageIds = await Promise.all(messageIdsPromise)
    const messagesPromise = messageIds.map( (id)=> this.contractService.messageContract.methods.messages(<any>id).call())
    const message = await Promise.all(messagesPromise)
    result = message.map((message, index)=>{
        return {messageId: <any>index, contentImprint: message.imprint, sender: message.sender, to: message.to} 
    })

    return result;
  }

  public markAsRead=async (
    messageId?: number
  ):Promise<ExtendedBoolean> => {

    const walletReward = this.configurationService.arianeeConfiguration.walletReward.address
     
    try {

        // Not necessary. It never throws. To update when reward getter become public
        await this.contractService.storeContract.methods.readMessage(messageId,walletReward).call();     
        await this.contractService.storeContract.methods.readMessage(messageId,walletReward).send();     

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
  
  public sendMessage=async (data: {
    contentImprint?: string;
    certificateId: number,
    content?: { $schema: string;[key: string]: any };
  }):Promise<
      { contentImprint: string,
       messageId: number}
    > => {

    let { certificateId, contentImprint,  content } = data;
    const brandReward = this.configurationService.arianeeConfiguration.brandDataHubReward.address;

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
      const result = await this.contractService.storeContract.methods.createMessage(certificateId, contentImprint, brandReward).send();

      return {
        // TODO !
        //store: this.storeArianeeEventContentInRPCServer,
        ...result,
        contentImprint: contentImprint
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
