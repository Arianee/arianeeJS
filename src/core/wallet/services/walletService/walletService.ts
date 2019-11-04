import {injectable, singleton} from "tsyringe";

@injectable()
export class WalletService {

  public account;

  public get publicKey (): string {
    return this.account.address;
  }

  public get privateKey (): string {
    return this.account.privateKey;
  }

}
