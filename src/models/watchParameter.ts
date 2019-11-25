import { Contract } from 'web3-eth-contract';

export interface watchParameter{
  contract:Contract,
  filter:{[key:string]:string},
  blockchainEvent: string,
  eventNames:string[]
}
