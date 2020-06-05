import { injectable, singleton } from 'tsyringe';

@injectable()
export class Store {
  private store = {};

  public getStoreItem = (storeKey: string) => {
    return Promise.resolve(JSON.parse(this.store[storeKey]));
  };

  public hasItem = (storeKey: string):Promise<boolean> => {
    return Promise.resolve(Object.prototype.hasOwnProperty.call(this.store, storeKey));
  };

  public setStoreItem = (storeKey: string, value:any) => {
    this.store[storeKey] = JSON.stringify(value);

    return Promise.resolve(this);
  };
}
