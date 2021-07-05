import { deepFreeze } from '../core/libs/deepFreeze';
import { NETWORK } from '../models/networkConfiguration';

export default deepFreeze({
  [NETWORK.testnet]: {
    networkName: NETWORK.testnet,
    faucetUrl: `https://faucet.arianee.org/faucet?network=${NETWORK.testnet}`,
    deepLink: 'test.arianee.net',
    alternativeDeeplink: ['test.arian.ee'],
    protocolVersion: 1
  },
  [NETWORK.mainnet]: {
    networkName: NETWORK.mainnet,
    faucetUrl: `https://faucet.arianee.org/faucet?network=${NETWORK.mainnet}`,
    deepLink: 'arianee.net',
    alternativeDeeplink: ['dev.test.arian.ee', 'arian.ee'],
    protocolVersion: 1
  },
  [NETWORK.arianeeTestnet]: {
    networkName: NETWORK.arianeeTestnet,
    faucetUrl: `http://localhost:3001/faucet?network=${NETWORK.arianeeTestnet}`,
    deepLink: 'localhost:4200',
    alternativeDeeplink: ['test.testnet.arian.ee'],
    protocolVersion: 2
  },
  [NETWORK.mumbai]: {
    networkName: NETWORK.mumbai,
    faucetUrl: `https://test.faucet.arianee.org/faucet?network=${NETWORK.mumbai}`,
    deepLink: 'testnet.poly.arian.ee',
    alternativeDeeplink: ['mumbai.arian.ee'],
    protocolVersion: 2
  },
  [NETWORK.polygon]: {
    networkName: NETWORK.polygon,
    faucetUrl: `https://test.faucet.arianee.org/faucet?network=${NETWORK.polygon}`,
    deepLink: 'poly.arian.ee',
    alternativeDeeplink: [],
    protocolVersion: 2
  }
});
