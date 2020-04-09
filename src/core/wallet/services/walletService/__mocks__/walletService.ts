export class WalletService {
  public account= {
    address: '0x23456789',
    privateKey: 'azokdnazoidfjn'
  }

  public get address (): string {
    return this.account.address;
  }

  public get publicKey (): string {
    return this.account.address;
  }

  public get privateKey (): string {
    return this.account.privateKey;
  }
}
