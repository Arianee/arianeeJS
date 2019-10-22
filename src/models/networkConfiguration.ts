export enum NETWORK {
  testnet = "testnet",
  mainnet = "mainnet"
}

export const networkURL = {
  [NETWORK.testnet]: "https://cert.arianee.org/contractAddresses/newsokol.json",
  [NETWORK.mainnet]:
    "https://cert.arianee.org/contractAddresses/newpoacore.json"
};
