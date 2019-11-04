export class SimpleSessionCache {
  private cache = {};

  get = (key: string) => {
    if (!Object.prototype.hasOwnProperty.call(this.cache, key)) {
      return Promise.reject(new Error('key'));
    } else {
      return Promise.resolve(JSON.parse(this.cache[key]));
    }
  }

  set = (key: string, value: any) => {
    this.cache[key] = JSON.stringify(value);

    return Promise.resolve(this);
  }
}
