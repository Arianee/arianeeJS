export enum NETWORK {
  testnet = 'testnet',
  mainnet = 'mainnet',
  arianeeTestnet = 'arianeetestnet',
  mumbai='mumbai',
  polygon='polygon',
  arialabs='arialabs',
  stadetoulousain='stadetoulousain',
  ysl= 'ysl',
  testnetSbt= 'testnetSbt',
  arianeeSupernet= 'arianeeSupernet',
  arianeesbt = 'arianeesbt',
  tezostestnet = 'tezostestnet',
  richemontsupernet = 'richemontsupernet'
}

export const networkURL = {
  [NETWORK.polygon]: 'https://cert.arianee.net/contractAddresses/polygon.json',
  [NETWORK.mumbai]: 'https://cert.arianee.net/contractAddresses/mumbai.json',
  [NETWORK.testnet]: 'https://cert.arianee.net/contractAddresses/newsokol.json',
  [NETWORK.mainnet]: 'https://cert.arianee.net/contractAddresses/newpoacore.json',
  [NETWORK.arianeeTestnet]: 'https://cert.arianee.net/contractAddresses/arianeetest.json',
  [NETWORK.arialabs]: 'https://cert.arianee.net/contractAddresses/arialabs.json',
  [NETWORK.stadetoulousain]: 'https://cert.arianee.net/contractAddresses/stadetoulousain.json',
  [NETWORK.ysl]: 'https://cert.arianee.net/contractAddresses/ysl.json',
  [NETWORK.testnetSbt]: 'https://cert.arianee.net/contractAddresses/testnetSbt.json',
  [NETWORK.arianeeSupernet]: 'https://cert.arianee.net/contractAddresses/arianeeSupernet.json',
  [NETWORK.arianeesbt]: 'https://cert.arianee.net/contractAddresses/arianeesbt.json',
  [NETWORK.tezostestnet]: 'https://cert.arianee.net/contractAddresses/tezostestnet.json',
  [NETWORK.richemontsupernet]: 'https://cert.arianee.net/contractAddresses/richemontsupernet.json',
};
