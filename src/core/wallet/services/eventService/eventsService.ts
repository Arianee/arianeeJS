import {injectable} from "tsyringe";
import {blockchainEvent} from "../../../../models/blockchainEvents";
import {CertificateId} from "../../../../models/CertificateId";
import {ArianeeHttpClient} from "../../../libs/arianeeHttpClient/arianeeHttpClient";
import {sortEvents} from "../../../libs/sortEvents";
import {ConfigurationService} from "../configurationService/configurationService";
import {ContractService} from "../contractService/contractsService";
import {IdentityService} from "../identityService/identityService";
import {UtilsService} from "../utilService/utilsService";
import {WalletService} from "../walletService/walletService";

@injectable()
export class EventService {
  private utils: UtilsService;

  constructor(
    private identityService: IdentityService,
    private contractService: ContractService,
    private walletService: WalletService,
    private configurationService: ConfigurationService,
    private httpClient: ArianeeHttpClient,
  ) {
  }

  public getCertificateTransferEvents = async (
    certificateId: CertificateId
  ): Promise<any> => {
    const sortedEvents = await this.contractService.smartAssetContract
      .getPastEvents("Transfer", {
        filter: {_tokenId: certificateId},
        fromBlock: 0,
        toBlock: "latest"
      })
      .then(events => events.sort(sortEvents));

    return Promise.all(
      sortedEvents.map(event =>
        this.identityService
          .getIdentity(event.returnValues._to)
          .then(identity => ({...event, identity: identity}))
      )
    );
  };

  public getCertificateArianeeEvents = async (
    certificateId: number,
    passphrase?: string
  ): Promise<any[]> => {
    const sortedEvents = await this.contractService.eventContract
      .getPastEvents(blockchainEvent.arianeeEvent.eventCreated, {
        filter: {_tokenId: certificateId},
        fromBlock: 0,
        toBlock: "latest"
      })
      .then(events => events.sort(sortEvents));

    if (sortedEvents.length > 0) {
      const issuerIdentity = await this.contractService.smartAssetContract.methods
        .issuerOf(certificateId)
        .call()
        .then(async issuer => {
          return await this.identityService.getIdentity(issuer);
        });

      return Promise.all(
        sortedEvents.map(async (event: any, index: number) => {
          let requestBody: any = {
            eventId: parseInt(event.returnValues._eventId),
            certificateId: parseInt(event.returnValues._tokenId)
          };

          let privateKey: string;
          if (passphrase) {
            privateKey = this.configurationService
              .walletFactory()
              .fromPassPhrase(passphrase).privateKey;
            requestBody.authentification = this.utils.signProofForRpc(
              certificateId,
              privateKey
            );
          } else {
            privateKey = this.walletService.privateKey;
            requestBody.authentification = this.utils.signProofForRpc(
              certificateId,
              privateKey
            );
          }

          return new Promise((resolve, reject) => {
            this.httpClient.RPCCall(
              issuerIdentity.data.rpcEndpoint,
              "event.read",
              requestBody
            );
          });
        })
      );
    }
  };

}
