export class SimpleSessionCache {
  private cache = {};

  get = (key: string) => {
    if (!this.cache.hasOwnProperty(key)) {
      return Promise.reject("key");
    } else {
      return Promise.resolve(JSON.parse(this.cache[key]));
    }
  }

  set = (key: string, value: any) => {
    this.cache[key] = JSON.stringify(value);

    return Promise.resolve(this);
  }
}
