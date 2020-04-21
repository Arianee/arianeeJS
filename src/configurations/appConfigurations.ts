import { NETWORK } from '../models/networkConfiguration';

export default {
  [NETWORK.testnet]: {
    networkName: NETWORK.testnet,
    faucetUrl: `https://faucet.arianee.org/faucet?network=${NETWORK.testnet}`,
    deepLink: 'test.arian.ee',
    alternativeDeeplink: []
  },
  [NETWORK.mainnet]: {
    networkName: NETWORK.mainnet,
    faucetUrl: `https://faucet.arianee.org/faucet?network=${NETWORK.mainnet}`,
    deepLink: 'arian.ee',
    alternativeDeeplink: ['dev.test.arian.ee']
  },
  [NETWORK.arianeeTestnet]: {
    networkName: NETWORK.arianeeTestnet,
    faucetUrl: `https://test.arian.ee/faucet?network=${NETWORK.arianeeTestnet}`,
    deepLink: 'test.testnet.arian.ee',
    alternativeDeeplink: []
  }
};
