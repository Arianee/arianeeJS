import { Arianee, NETWORK } from '../../../src';
import { ArianeeWallet } from '../../../src/core/wallet';
import axios from 'axios';

export const makeWalletReady = async (wallet: ArianeeWallet
): Promise<ArianeeWallet> => {
  await Promise.all([legacyRequestPoa(wallet.address), legacyRequestAria(wallet.address)]);

  await wallet.methods.approveStore();

  return wallet;
};
export const legacyRequestPoa = (address:string) => {
  return axios.get(`http://localhost:3000/faucet/?network=arianeetestnet&address=${address}`);
};
export const legacyRequestAria = (address:string) => {
  return axios.get(`http://localhost:3000/faucet/?network=arianeetestnet&address=${address}&aria=true`);
};
