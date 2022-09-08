
export enum NETWORK {
  testnet = 'testnet',
  mainnet = 'mainnet',
  arianeeTestnet = 'arianeetestnet',
  mumbai='mumbai',
  polygon='polygon',
  arialabs='arialabs',
  stadetoulousain='stadetoulousain',
  ysl= 'ysl'
}

export const networkURL = {
  [NETWORK.polygon]: 'https://cert.arianee.net/contractAddresses/polygon.json',
  [NETWORK.mumbai]: 'https://cert.arianee.net/contractAddresses/mumbai.json',
  [NETWORK.testnet]: 'https://cert.arianee.net/contractAddresses/newsokol.json',
  [NETWORK.mainnet]: 'https://cert.arianee.net/contractAddresses/newpoacore.json',
  [NETWORK.arianeeTestnet]: 'https://cert.arianee.net/contractAddresses/arianeetest.json',
  [NETWORK.arialabs]: 'https://cert.arianee.net/contractAddresses/arialabs.json',
  [NETWORK.stadetoulousain]: 'https://cert.arianee.net/contractAddresses/stadetoulousain.json',
  [NETWORK.ysl]: 'https://cert.arianee.net/contractAddresses/ysl.json'
};

export type ChainId = number;
export enum ChainType {
  mainnet = 'mainnet',
  testnet = 'testnet',
}

export const CHAIN_TYPE_DETAILED: {
  [key in ChainType]: { name: NETWORK; id: ChainId }[];
} = {
  testnet: [
    { name: NETWORK.testnet, id: 77 },
    { name: NETWORK.mumbai, id: 80001 },
    { name: NETWORK.arianeeTestnet, id: 1337 }
  ],
  mainnet: [
    { name: NETWORK.mainnet, id: 99 },
    { name: NETWORK.polygon, id: 137 },
    { name: NETWORK.stadetoulousain, id: 137 },
    { name: NETWORK.ysl, id: 137 },
    { name: NETWORK.arialabs, id: 137 }
  ]
};
