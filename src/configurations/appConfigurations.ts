import { deepFreeze } from '../core/libs/deepFreeze/deepFreeze';
import { NETWORK } from '../models/networkConfiguration';

export default deepFreeze({
  [NETWORK.testnet]: {
    networkName: NETWORK.testnet,
    faucetUrl: `https://faucet2.arianee.net/faucet?network=${NETWORK.testnet}`,
    deepLink: 'test.arianee.net',
    alternativeDeeplink: ['test.arian.ee'],
    protocolVersion: 1
  },
  [NETWORK.mainnet]: {
    networkName: NETWORK.mainnet,
    faucetUrl: `https://faucet2.arianee.net/faucet?network=${NETWORK.mainnet}`,
    deepLink: 'arianee.net',
    alternativeDeeplink: ['dev.test.arian.ee', 'arian.ee'],
    protocolVersion: 1
  },
  [NETWORK.arianeeTestnet]: {
    networkName: NETWORK.arianeeTestnet,
    faucetUrl: `http://localhost:3000/faucet?network=${NETWORK.arianeeTestnet}`,
    deepLink: 'wallet:4200',
    alternativeDeeplink: ['test.testnet.arian.ee'],
    protocolVersion: 2
  },
  [NETWORK.mumbai]: {
    networkName: NETWORK.mumbai,
    faucetUrl: `https://faucet2.arianee.net/faucet?network=${NETWORK.mumbai}`,
    deepLink: 'testnet.poly.arian.ee',
    alternativeDeeplink: ['mumbai.arian.ee'],
    protocolVersion: 2
  },
  [NETWORK.polygon]: {
    networkName: NETWORK.polygon,
    faucetUrl: `https://faucet2.arianee.net/faucet?network=${NETWORK.polygon}`,
    deepLink: 'poly.arian.ee',
    alternativeDeeplink: [],
    protocolVersion: 2
  },
  [NETWORK.arialabs]: {
    networkName: NETWORK.arialabs,
    faucetUrl: `https://faucet2.arianee.net/faucet?network=${NETWORK.arialabs}`,
    deepLink: 'arialabs.arian.ee',
    alternativeDeeplink: [],
    protocolVersion: 2
  },
  [NETWORK.stadetoulousain]: {
    networkName: NETWORK.stadetoulousain,
    faucetUrl: `https://faucet2.arianee.net/faucet?network=${NETWORK.stadetoulousain}`,
    deepLink: 'stadetoulousain.arian.ee',
    alternativeDeeplink: [],
    protocolVersion: 2
  },
  [NETWORK.ysl]: {
    networkName: NETWORK.ysl,
    faucetUrl: `https://faucet2.arianee.net/faucet?network=${NETWORK.ysl}`,
    deepLink: 'polygon.yslbeauty.com',
    alternativeDeeplink: [],
    protocolVersion: 2
  },
  [NETWORK.testnetSbt]: {
    networkName: NETWORK.testnetSbt,
    faucetUrl: `https://faucet2.arianee.net/faucet?network=${NETWORK.testnet}`,
    deepLink: 'testsbt.arianee.net',
    alternativeDeeplink: ['testsbt.arian.ee'],
    protocolVersion: 2
  }
});
