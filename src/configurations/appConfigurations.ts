import { deepFreeze } from '../core/libs/deepFreeze';
import { NETWORK } from '../models/networkConfiguration';

export default deepFreeze({
  [NETWORK.testnet]: {
    networkName: NETWORK.testnet,
    faucetUrl: `https://faucet.arianee.org/faucet?network=${NETWORK.testnet}`,
    deepLink: 'test.arianee.net',
    alternativeDeeplink: ['test.arian.ee']
  },
  [NETWORK.mainnet]: {
    networkName: NETWORK.mainnet,
    faucetUrl: `https://faucet.arianee.org/faucet?network=${NETWORK.mainnet}`,
    deepLink: 'arianee.net',
    alternativeDeeplink: ['dev.test.arian.ee', 'arian.ee']
  },
  [NETWORK.arianeeTestnet]: {
    networkName: NETWORK.arianeeTestnet,
    faucetUrl: `https://test.arian.ee/faucet?network=${NETWORK.arianeeTestnet}`,
    deepLink: 'test.testnet.arian.ee',
    alternativeDeeplink: []
  },
  [NETWORK.mumbai]: {
    networkName: NETWORK.mumbai,
    faucetUrl: `https://test.arian.ee/faucet?network=${NETWORK.mumbai}`,
    deepLink: 'testnet.poly.arian.ee',
    alternativeDeeplink: ['mumbai.arian.ee']
  },
  [NETWORK.polygon]: {
    networkName: NETWORK.polygon,
    faucetUrl: `https://test.arian.ee/faucet?network=${NETWORK.polygon}`,
    deepLink: 'poly.arian.ee',
    alternativeDeeplink: []
  }
});
