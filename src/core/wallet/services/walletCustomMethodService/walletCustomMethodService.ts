import {injectable, singleton} from "tsyringe";
import {creditTypeEnum} from "../../../../models/creditTypesEnum";
import {ArianeeHttpClient} from "../../../libs/arianeeHttpClient/arianeeHttpClient";
import {CertificateService} from "../certificateService/certificateService";
import {ConfigurationService} from "../configurationService/configurationService";
import {ContractService} from "../contractService/contractsService";
import {EventService} from "../eventService/eventsService";
import {WalletService} from "../walletService/walletService";
import {Web3Service} from "../web3Service/web3Service";

@injectable()
export class WalletCustomMethodService {

  constructor (private httpClient: ArianeeHttpClient,
              private configurationService: ConfigurationService,
              private web3Service: Web3Service,
              private contractService: ContractService,
              private eventService: EventService,
              private walletService: WalletService,
              private certificateService: CertificateService
  ) {

  }

  public getMethods () {
    return {
      createCertificate: this.certificateService.customHydrateToken,
      getCertificate: this.certificateService.getCertificate,
      getMyCertificates: this.certificateService.getMyCertificates,
      getMyCertificatesGroupByIssuer: this.certificateService.getMyCertificatesGroupByIssuer,

      createCertificateRequestOwnershipLink: this.certificateService
        .createCertificateRequestOwnershipLink,
      createCertificateProofLink: this.certificateService.createCertificateProofLink,

      getCertificateFromLink: this.certificateService.getCertificateFromLink,

      isCertificateProofValid: this.certificateService.isCertificateProofValid,

      isCertificateOwnershipRequestable: this.certificateService.isCertificateOwnershipRequestable,
      requestCertificateOwnership: this.certificateService.customRequestToken,
      balanceOfAria: this.balanceOfAria,
      balanceOfPoa: this.balanceOfPoa,
      approveStore: this.approveStore,
      buyCredits: this.buyCredits,

      getCertificateTransferEvents: this.eventService.getCertificateTransferEvents,
      getCertificateArianeeEvents: this.eventService.getCertificateArianeeEvents,

    };
  }

  public balanceOfAria = async (address = this.walletService.account.address): Promise<string> => {

    const balance = await this.contractService.ariaContract.methods
      .balanceOf(address)
      .call();

    return balance.toString();
  }

  public balanceOfPoa = async (address = this.walletService.account.address): Promise<string> => {

    const balance = await this.web3Service.web3.eth
      .getBalance(address);

    return balance;
  }
  public requestPoa = (): Promise<any> => {
    return this.httpClient.fetch(
      this.configurationService.arianeeConfiguration.faucetUrl +
      "&address=" +
      this.walletService.account.address
    );
  }

  public requestAria = (): Promise<any> => {
    return this.httpClient.fetch(
      this.configurationService.arianeeConfiguration.faucetUrl +
      "&address=" +
      this.walletService.account.address +
      "&aria=true"
    );
  }

  private approveStore = () => {
    return this.contractService.ariaContract.methods
      .approve(
        this.configurationService.arianeeConfiguration.store.address,
        "10000000000000000000000000000"
      )
      .send();
  }

  public buyCredits = (creditType: string, quantity: number, receiver?: string) => {

    if (!creditTypeEnum.hasOwnProperty(creditType)) {
      throw new Error('this credit type does not exist !!! ' + creditType);
    }

    receiver = receiver || this.walletService.publicKey;

    return this.contractService.storeContract.methods
      .buyCredit(creditTypeEnum[creditType], quantity, receiver)
      .send();

  }

}
