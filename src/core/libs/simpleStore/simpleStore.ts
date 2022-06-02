import { injectable } from 'tsyringe';
import { ArianeeEventEmitter } from '../../wallet/services/arianeeEventEmitterService/ArianeeEventEmitter';

import { Store } from './store';
import { ConfigurationService } from '../../wallet/services/configurationService/configurationService';
import { WalletService } from '../../wallet/services/walletService/walletService';

@injectable()
export class SimpleStore {
  constructor (private store:Store,
               private arianeeConfig:ConfigurationService,
               private walletService:WalletService,
               private arianeeEventEmitter: ArianeeEventEmitter
  ) {}

  private cache = {};

  keyBuilder = (namespace:string, key):string => {
    return `${this.walletService.address}/${this.arianeeConfig.arianeeConfiguration.chainId}/${this.arianeeConfig.arianeeConfiguration.networkName}/${namespace}/${key}`;
  };

  public get = async <T>(namespace:string, key: string|number, getter: ()=> Promise<any>, force = false):Promise<T> => {
    const storeKey = this.keyBuilder(namespace, key);
    if (!(await this.store.hasItem(storeKey)) || force) {
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

  public set = async (namespace:string, key: string|number, value: any):Promise<Store> => {
    const storeKey = this.keyBuilder(namespace, key);

    const store = await this.store.setStoreItem(storeKey, value);

    this.arianeeEventEmitter.EE.emit('StoreChange', {
      namespace,
      key,
      value
    });

    return store;
  };
}
