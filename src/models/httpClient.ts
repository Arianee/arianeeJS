export interface HttpClient {
  get: (...args) => Promise<any>;
  post?: (...args) => Promise<any>;
}
