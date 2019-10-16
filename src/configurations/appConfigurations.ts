import { NETWORK } from "../models/networkConfiguration";

export default {
  [NETWORK.testnet]: {
    "faucetUrl": `https://faucet.arianee.org/faucet?network=${NETWORK.testnet}`,
    "deepLink": "test.arian.ee"
  },
  [NETWORK.mainnet]: {
    "faucetUrl": `https://faucet.arianee.org/faucet?network=${NETWORK.mainnet}`,
    "deepLink": "arian.ee/"
  },
};