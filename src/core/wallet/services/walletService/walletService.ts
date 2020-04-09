import { injectable, singleton } from 'tsyringe';

@injectable()
export class WalletService {
  public account;

  public get address (): string {
    return this.account.address;
  }

  public get privateKey (): string {
    return this.account.privateKey;
  }

  public bdhVaultURL:string;

  public isBdhVault ():boolean {
    return this.bdhVaultURL !== undefined;
  }
}
