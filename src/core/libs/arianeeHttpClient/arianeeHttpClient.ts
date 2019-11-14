import axios from 'axios';
import { singleton } from 'tsyringe';
import { SimpleSessionCache } from '../simpleCache/simpleSessionCache';

@singleton()
export class ArianeeHttpClient {
  constructor (private httpCacheManage: SimpleSessionCache) {
  }

    private fetchingCache = {};

    /**
     * Calculate hash key from url and headers of a request
     * @param url
     * @param config
     * @return {string}
     */
    private static createKeyFromURL = (url, config) => {
      const hash = function (s) {
        let a = 1;
        let c = 0;
        let h;
        let o;
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

    private RPConfigFactory = (endpoint, method, params) => {
      return {
        method: 'POST',
        data: {
          jsonrpc: '2.0',
          method: method,
          params: params,
          id: ArianeeHttpClient.createKeyFromURL(endpoint, params)
        },
        headers: {
          'Content-Type': 'application/json'
        }
      };
    }

    private RPCCallHandler=async(endpoint: string, method: string, params: any,withCache:boolean)=>{
      const config = this.RPConfigFactory(endpoint, method, params);
      let RPCRes;
      if(withCache){
        const customKey = { ...params };
        delete customKey.authentification;
        const storageKey = ArianeeHttpClient.createKeyFromURL(endpoint, customKey);
        RPCRes = await this.fetchWithCache(endpoint, config, storageKey);
      }else{
        RPCRes=  await this.fetch(endpoint, config);
      }

      if(RPCRes.error){
        throw new Error();
      }

      return (typeof (RPCRes.result) === 'string') ? JSON.parse(RPCRes.result) : RPCRes.result;
    }

   public RPCCallWithCache = async (endpoint: string, method: string, params: any) => {
     return this.RPCCallHandler(endpoint,method,params,true)
    }

    public RPCCall = async (endpoint: string, method: string, params: any) => {
        return this.RPCCallHandler(endpoint,method,params,false)
    }

    /**
     *
     * If HTTP call with same url & headers has been made, it will return previous result
     * else it will make the call and store it
     * @param url
     * @param config
     * @param specialKey
     * @return Promise{any}
     */
    public fetchWithCache = (
      url: string,
      config: any = { ...ArianeeHttpClient.defaultConfig },
      specialKey?: string
    ) => {
      const key = specialKey || ArianeeHttpClient.createKeyFromURL(url, config);

      return this.httpCacheManage.get(key).catch(() => {
        // it does not exist in storage cache, but it is already fetching
        if (!Object.prototype.hasOwnProperty.call(this.fetchingCache, key)) {
          this.fetchingCache[key] = this.fetch(url, config)
            .then(result => {
              this.httpCacheManage.set(key, result);

              return result;
            }).finally(() => {
              delete this.fetchWithCache[key];
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
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
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
