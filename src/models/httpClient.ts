import { AxiosRequestConfig } from 'axios';

export interface HttpClient {
  get: (...args) => Promise<any>;
  post?: (...args) => Promise<any>;
}

export interface HttpInterceptorObject {
  url: string,
  config: AxiosRequestConfig
}

export interface HttpInterceptor {
  httpRequestInterceptor:HttpRequestInterceptor
}
export type HttpRequestInterceptor=(url, config)=>Promise<HttpInterceptorObject>;
