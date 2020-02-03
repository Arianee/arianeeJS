import Web3 from 'web3';
import { Arianee, NETWORK } from '../src';

(async function () {
  var options = { headers: [{ name: 'apikey', value: 'REPLACE BY API KEYS' }] };
  var web3Provider = new Web3.providers.HttpProvider('https://api.rockside.io/ethereum/poanetwork/jsonrpc', options);

  console.time('label');
  const arianee = await new Arianee().init(NETWORK.mainnet);

  const wallet = arianee.fromMnemonic('Latin math normal cargo divert brick mechanic occur find thunder click travel');

  const certificateSummary = await wallet.methods.getMyCertificates({ content: true, issuer: true });
  console.timeEnd('label');
})();
