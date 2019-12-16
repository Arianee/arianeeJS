import { Transaction } from 'web3-core';
import { injectable } from 'tsyringe';
import { ArianeeHttpClient } from '../../../libs/arianeeHttpClient/arianeeHttpClient';
import { ConfigurationService } from '../configurationService/configurationService';
import { UtilsService } from '../utilService/utilsService';
import { WalletService } from '../walletService/walletService';

@injectable()
export class BDHAPIService {
  constructor (private walletService:WalletService, private utilsService:UtilsService) {}

  private get bdhURL ():string {
    return this.walletService.bdhVaultURL;
  }

  private async authFetch (url, data):Promise<string> {
    const auth = this.utilsService.signProof(JSON.stringify(data), this.walletService.privateKey);

    const Authorization = `Signature keyId="${auth.signature}",algorithm="ECDSA"`;

    return ArianeeHttpClient.fetch(url, {
      headers: {
        Authorization
      },
      method: 'post',
      data
    }
    );
  }

  public signTransaction (transaction:Transaction):Promise<string> {
    const url = `${this.bdhURL}/wallet/signTransaction`;
    return this.authFetch(url, transaction);
  }
}
