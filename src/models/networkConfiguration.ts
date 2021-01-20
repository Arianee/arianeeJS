export enum NETWORK {
  testnet = 'testnet',
  mainnet = 'mainnet',
  arianeeTestnet = 'arianeetestnet'
}

export const networkURL = {
  [NETWORK.testnet]: 'https://cert.arianee.net/contractAddresses/newsokol.json',
  [NETWORK.mainnet]:
    'https://cert.arianee.net/contractAddresses/newpoacore.json',
  [NETWORK.arianeeTestnet]: 'https://cert.arianee.net/contractAddresses/arianeetest.json'
};
