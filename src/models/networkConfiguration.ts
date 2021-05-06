export enum NETWORK {
  testnet = 'testnet',
  mainnet = 'mainnet',
  arianeeTestnet = 'arianeetestnet',
  mumbai='mumbai',
  polygon='polygon'
}

export const networkURL = {
  [NETWORK.polygon]: 'https://cert.arianee.net/contractAddresses/polygon.json',
  [NETWORK.mumbai]: 'https://cert.arianee.net/contractAddresses/mumbai.json',
  [NETWORK.testnet]: 'https://cert.arianee.net/contractAddresses/newsokol.json',
  [NETWORK.mainnet]:
    'https://cert.arianee.net/contractAddresses/newpoacore.json',
  [NETWORK.arianeeTestnet]: 'https://cert.arianee.net/contractAddresses/arianeetest.json'
};
