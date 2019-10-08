import {
  Aria,
  ArianeeCreditHistory,
  ArianeeIdentity,
  ArianeeStaking,
  ArianeeStore,
  ArianeeWhitelist,
  ArianeeSmartAsset,
  ArianeeEvent
} from "@arianee/ts-contracts";

import { Utils } from "../libs/utils";
import { ServicesHub } from "../servicesHub/servicesHub";
import { ArianeeContract } from "../libs/arianeeContract";

export class ArianeeWallet {
  public storeContract: ArianeeStore;
  public smartAssetContract: ArianeeSmartAsset;
  public identityContract: ArianeeIdentity;
  public ariaContract: Aria;
  public creditHistoryContract: ArianeeCreditHistory;
  public whitelistContract: ArianeeWhitelist;
  public stakingContract: ArianeeStaking;
  public eventContract: ArianeeEvent;
  public utils = new Utils(this.servicesHub.web3);

  protected brandDataHubRewardAddress =
    "0xA79B29AD7e0196C95B87f4663ded82Fbf2E3ADD8";

  protected walletRewardAddress = "0x39da7e30d2D5F2168AE3B8599066ab122680e1ef";

  constructor(public servicesHub: ServicesHub, private _account) {
    this.smartAssetContract = new ArianeeContract<ArianeeSmartAsset>(
      this.servicesHub.contracts.smartAssetContract,
      this,
      this.servicesHub
    ).makeArianee();

    this.identityContract = new ArianeeContract<ArianeeIdentity>(
      this.servicesHub.contracts.identityContract,
      this,
      this.servicesHub
    ).makeArianee();

    this.ariaContract = new ArianeeContract<Aria>(
      this.servicesHub.contracts.ariaContract,
      this,
      this.servicesHub
    ).makeArianee();

    this.storeContract = new ArianeeContract<ArianeeStore>(
      this.servicesHub.contracts.storeContract,
      this,
      this.servicesHub
    ).makeArianee();

    this.creditHistoryContract = new ArianeeContract<ArianeeCreditHistory>(
      this.servicesHub.contracts.creditHistoryContract,
      this,
      this.servicesHub
    ).makeArianee();

    this.whitelistContract = new ArianeeContract<ArianeeWhitelist>(
      this.servicesHub.contracts.whitelistContract,
      this,
      this.servicesHub
    ).makeArianee();

    this.stakingContract = new ArianeeContract<ArianeeStaking>(
      this.servicesHub.contracts.stakingContract,
      this,
      this.servicesHub
    ).makeArianee();

    this.eventContract = new ArianeeContract<ArianeeEvent>(
      this.servicesHub.contracts.eventContract,
      this,
      this.servicesHub
    ).makeArianee();
  }

  public get publicKey(): string {
    return this.account.address;
  }

  public get privateKey(): string {
    return this.account.privateKey;
  }

  public get web3() {
    return this.servicesHub.web3;
  }

  public get account() {
    return this._account;
  }
}
