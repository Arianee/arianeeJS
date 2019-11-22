import { injectable } from 'tsyringe';

import { Store } from './store';
import { ConfigurationService } from '../../wallet/services/configurationService/configurationService';
import { WalletService } from '../../wallet/services/walletService/walletService';

@injectable()
export class SimpleStore {
  constructor (private store:Store, private arianeeConfig:ConfigurationService, private walletService:WalletService) {}

  private cache = {};

  keyBuilder = (namespace:string, key):string => {
    return `${this.walletService.publicKey}/${this.arianeeConfig.arianeeConfiguration.chainId}/${namespace}/${key}`;
  };

  public get = async <T>(namespace:string, key: string, getter: ()=> Promise<any>):Promise<T> => {
    const storeKey = this.keyBuilder(namespace, key);
    if (!(await this.store.hasItem(storeKey))) {
      if (!Object.prototype.hasOwnProperty.call(this.cache, storeKey)) {
        this.cache[storeKey] = getter()
          .then(value => {
            this.set(namespace, key, value);
            return value;
          })
          .finally(() => {
            delete this.cache[storeKey];
          });
      }
      return this.cache[storeKey];
    } else {
      return this.store.getStoreItem(storeKey);
    }
  };

  public set = (namespace:string, key: string, value: any) => {
    const storeKey = this.keyBuilder(namespace, key);

    return this.store.setStoreItem(storeKey, value);
  };
}
