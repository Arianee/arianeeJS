import axios from "axios";
import { SimpleSessionCache } from "./simpleCache/simpleSessionCache";

export class ArianeeHttpClient {
  constructor (private httpCacheManage = new SimpleSessionCache()) {}

  private fetchingCache = {};

  /**
   * Calculate hash key from url and headers of a request
   * @param url
   * @param config
   * @return {string}
   */
  private static createKeyFromURL = (url, config) => {
    const hash = function (s) {
      let a = 1,
        c = 0,
        h,
        o;
      if (s) {
        a = 0;
        for (h = s.length - 1; h >= 0; h--) {
          o = s.charCodeAt(h);
          a = ((a << 6) & 268435455) + o + (o << 14);
          c = a & 266338304;
          a = c !== 0 ? a ^ (c >> 21) : a;
        }
      }

      return String(a);
    };

    return hash(JSON.stringify(url) + JSON.stringify(config));
  }

  public RPCCall = async (endpoint: string, method: string, params: any) => {
    const config = {
      method: "POST",
      data: {
        jsonrpc: "2.0",
        method: method,
        params: params,
        id: ArianeeHttpClient.createKeyFromURL(endpoint, params)
      },
      headers: {
        "Content-Type": "application/json"
      }
    };

    const RPCRes = await this.fetchWithCache(endpoint, config);

    return JSON.parse(RPCRes.result);
  }

  /**
   *
   * If HTTP call with same url & headers has been made, it will return previous result
   * else it will make the call and store it
   * @param url
   * @param config
   * @return Promise{any}
   */
  public fetchWithCache = (
    url: string,
    config: any = { ...ArianeeHttpClient.defaultConfig }
  ) => {
    const key = ArianeeHttpClient.createKeyFromURL(url, config);

    return this.httpCacheManage.get(key).catch(() => {
      // it does not exist in storage cache, but it is already fetching
      if (!this.fetchingCache.hasOwnProperty(key)) {
        this.fetchingCache[key] = this.fetch(url, config).then(result => {
          this.httpCacheManage.set(key, result);

          return result;
        });
      }

      return this.fetchingCache[key];
    });
  }

  /**
   * Default headers for fetch
   */
  public static get defaultConfig () {
    return {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    };
  }

  /**
   * HTTP call
   * Default configuration of headers is method GET and content-type: application/json
   * @param url
   * @param config
   * @return Promise{any}
   */
  public static fetch (
    url: string,
    config: any = { ...ArianeeHttpClient.defaultConfig }
  ) {
    if (config.body) {
      config.data = config.body;
    }

    return axios(url, config).then(result => result.data);
  }

  /**
   * The exact same method as static fetch method
   */
  public fetch = ArianeeHttpClient.fetch;
}
