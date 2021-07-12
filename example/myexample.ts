import assert from 'assert';
import { Arianee, NETWORK } from '../src';

(async function () {
  const arianee = await new Arianee().init(NETWORK.testnet);

  const wallet = await arianee.fromMnemonic('tomorrow bomb dice toe stock save crush narrow name then document trigger');

  console.log(wallet.privateKey);
  const data = {
    nonce: 34,
    chainId: 77,
    from: '0xD6f0aE1ea945f6f3C2E8E0c1AE24Aa8b1C52edb5',
    data:
        '0x095ea7b300000000000000000000000082890cedcb8eb0cdc229ac7b8fdd39f93700c8540000000000000000000000000000000000000000204fce5e3e25026110000000',
    to: '0xB81AFe27c103bcd42f4026CF719AF6D802928765',
    gasLimit: 2000000,
    gasPrice: 1000000000,
    value: '0x00'
  };

  const d = await wallet.web3.eth.accounts.signTransaction(data, wallet.privateKey);

  const signed = await wallet.walletservice.signTransaction(data);

  const rawTx = '0xf8aa22843b9aca00831e848094b81afe27c103bcd42f4026cf719af6d80292876580b844095ea7b300000000000000000000000082890cedcb8eb0cdc229ac7b8fdd39f93700c8540000000000000000000000000000000000000000204fce5e3e2502611000000081bda0383aa9fae249aa12f81c526147e5b6b55faf4fb2aa1efcf57f641adda8f72339a03cb23500c4dfec2beb72e13dcff4ec9044aaa8a8d18992d3e16ec3ec723a0b7c';

  assert(d.rawTransaction === rawTx);
  assert(signed.transactionHash === '0x986371ecd4b13e33adeac7bc4edf99a626a1b814d71d60276fb17ee927af0dcd');
})();
// 0x3c5245df986a01fde14fc0b4d34b6a7562ca441287e829aa235de1855bb19c81
