import Contract from "web3/eth/contract";
import {ArianeeConfig} from "../../models/arianeeConfiguration";

export class ArianeeContractBuilder {
  public smartAssetContract: Contract;
  public identityContract: Contract;
  public ariaContract: Contract;
  public storeContract: Contract;
  public creditHistoryContract: Contract;
  public stakingContract: Contract;
  public whitelistContract: Contract;
  public eventContract: Contract;

  constructor(public web3, public arianeeConfig: ArianeeConfig) {

    this.smartAssetContract = new this.web3.eth.Contract(
      this.arianeeConfig.smartAsset.abi,
      this.arianeeConfig.smartAsset.address
    );

    this.identityContract = new this.web3.eth.Contract(
      this.arianeeConfig.identity.abi,
      this.arianeeConfig.identity.address
    );

    this.ariaContract = new this.web3.eth.Contract(
      this.arianeeConfig.aria.abi,
      this.arianeeConfig.aria.address
    );

    this.storeContract = new this.web3.eth.Contract(
      this.arianeeConfig.store.abi,
      this.arianeeConfig.store.address
    );

    this.creditHistoryContract = new this.web3.eth.Contract(
      this.arianeeConfig.creditHistory.abi,
      this.arianeeConfig.creditHistory.address
    );

    this.whitelistContract = new this.web3.eth.Contract(
      this.arianeeConfig.whitelist.abi,
      this.arianeeConfig.whitelist.address
    );

    this.stakingContract = new this.web3.eth.Contract(
      this.arianeeConfig.staking.abi,
      this.arianeeConfig.staking.address
    );

    if (
      this.arianeeConfig.eventArianee.abi &&
      this.arianeeConfig.eventArianee.address
    ) {
      this.eventContract = new this.web3.eth.Contract(
        this.arianeeConfig.eventArianee.abi,
        this.arianeeConfig.eventArianee.address
      );
    }
  }
}
