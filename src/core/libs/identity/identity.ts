import { Cert } from '@0xcert/cert';
import axios from 'axios';
import { NETWORK, networkURL } from '../../../models/networkConfiguration';
import Web3 from 'web3';

import { appConfig, contracts } from '../../../configurations';

type IdentityData = {
  [key: string]: any;
  $schema: string;
};

export const getIdentityAuthenticityAndApproval = async (params: {
  network: NETWORK;
  identityAddress: string;
  identityData: IdentityData;
}): Promise<{ isAuthentic: boolean; isApproved: boolean }> => {
  const { network, identityAddress, identityData } = params;
  if (!identityData.$schema) {
    return { isAuthentic: false, isApproved: false };
  }

  const identityContract = await getIdentityContract(network);

  const [calculatedImprint, expectedImprint, isApproved] = await Promise.all([
    calculateImprint(identityData),
    identityContract.methods.addressImprint(identityAddress).call(),
    identityContract.methods.addressIsApproved(identityAddress).call()
  ]);

  const isAuthentic = calculatedImprint === expectedImprint;

  return {
    isAuthentic,
    isApproved
  };
};

const getIdentityContract = async (network: NETWORK) => {
  const networkInfos: { contractAdresses: { identity: string }; httpProvider: string } = (
    await axios.get(networkURL[network])
  ).data;
  const web3 = new Web3(networkInfos.httpProvider);

  const { protocolVersion } = appConfig[network];
  const abi = contracts[protocolVersion].identity;

  const address = networkInfos.contractAdresses.identity;
  const contract = new web3.eth.Contract(abi, address);

  return contract;
};

const calculateImprint = async (identityData: IdentityData): Promise<string> => {
  const $schema = (await axios.get(identityData.$schema)).data;

  const cert = new Cert({
    schema: $schema
  });

  const cleanData = cleanObject(identityData);

  const calculatedImprint = await cert.imprint(cleanData);

  return `0x${calculatedImprint}`;
};

const cleanObject = (obj: any) => {
  for (const propName in obj) {
    if (obj[propName] && obj[propName].constructor === Array && obj[propName].length === 0) {
      delete obj[propName];
    }
  }

  return obj;
};
