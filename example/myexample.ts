import {utils} from 'ethers';
import {makeWalletReady} from '../features/steps/helpers/walletCreator';
import { Arianee, NETWORK } from '../src';
import Common from '@ethereumjs/common';
import {Transaction} from '@ethereumjs/tx';

(async function () {
  const arianee = await new Arianee().init(NETWORK.testnet);

  const externalWalletFactory = (pk?) => {
    let walletTemp;
    if (pk) {
      walletTemp = arianee.fromPrivateKey(pk);
    } else {
      walletTemp = arianee.fromRandomKey();
    }

    const wallet = arianee.fromExternalWallet({
      address: walletTemp.address,
      customSign: (data) => {
        return walletTemp.walletservice.sign(data);
      }
    });

    return wallet;
  };

  try {
    // const wallet1 = externalWalletFactory('0xe331b6d69882b4cb4ea581d88e0b604039a3de5967688d3dcffdd2270c0fd109');

    const walletTemp = arianee.fromRandomKey();

    const wallet2 = arianee.fromExternalWallet({
      address: walletTemp.address,
      customSign: (data)=>walletTemp.walletservice.sign(data)
    });

    await wallet2.methods.approveStore();
  } catch (e) {
    console.log(e);
  }

  /*
  const EthereumTx = require('ethereumjs-tx').Transaction;
  const privateKey = Buffer.from(
      'e331b6d69882b4cb4ea581d88e0b604039a3de5967688d3dcffdd2270c0fd109',
      'hex'
  );

  const txParams = {
    nonce: '0x00',
    gasPrice: '0x09184e72a000',
    gasLimit: '0x200710',
    to: '0x0000000000000000000000000000000000000000',
    value: '0x00',
    chainId: 77,
    data: '0x7f7465737432000000000000000000000000000000000000000000000000000000600057'
  };

  const tx2 = {
    nonce: 0,
    chainId: 77,
    data:
        '0x095ea7b300000000000000000000000082890cedcb8eb0cdc229ac7b8fdd39f93700c8540000000000000000000000000000000000000000204fce5e3e25026110000000',
    to: '0xB81AFe27c103bcd42f4026CF719AF6D802928765',
    gas: 2000000,
    gasPrice: 1000000000
  };

  const txParamsWeb3 = {
    nonce: '0x00',
    from: '0x0000000000000000000000000000000000000000',
    gasPrice: '0x09184e72a000',
    gas: '0x200710',
    to: '0x0000000000000000000000000000000000000000',
    value: '0x00',
    data: '0x7f7465737432000000000000000000000000000000000000000000000000000000600057'
  };

  const txFromWeb3 = await wallet.web3.eth.accounts.signTransaction(txParamsWeb3, wallet.privateKey);
  const b = await wallet.walletservice.signTransaction(txParams as Transaction);

 // console.log(b.rawTransaction === txFromWeb3.rawTransaction);

  const app = await wallet.methods.approveStore().catch(e => {
    console.log(e);
  });

    console.log('1',signedProof.message)
    // 1 message:string => message signé | tx.serialize().toString('hex');
    // 2

    const b = tx.sign(privateKey).serialize().toString('hex');
    console.log('2',b);

    console.log('');
    console.log('3', txFromWeb3);
    console.log(txFromWeb3 === '0x' + b);
  */
  // console.log(arianee.fromRandomMnemonic().mnemnonic);

  /* arianee.fromRandomMnemonic().methods.approveStore()
    .catch(e => console.log(e));

  // arianee.fromExternalWallet({address:'',customSendTransaction:()=>{}})

  /*
  const parentContent0 = {
    $schema: 'https://cert.arianee.org/version3/ArianeeProductCertificate-i18n.json',
    name: 'john',
    externalContents: [
      {
        title: 'About Arianee',
        url: 'https://www.arianee.org',
        backgroundColor: '#000',
        color: '#FFF'
      }
    ]
  };

  const parentContent1 = {
    $schema: 'https://cert.arianee.org/version3/ArianeeProductCertificate-i18n.json',
    sku: '"mon sky',
    title: 'titre nonnon',
    externalContents: [
      {
        title: 'About Arianee',
        url: 'https://www.arianee.org',
        backgroundColor: '#000',
        color: '#FFF'
      }
    ]
  };

  const content = {
    $schema: 'https://cert.arianee.org/version3/ArianeeProductCertificate-i18n.json',
    title: 'mon titre',
    parentCertificates: [
      {
        type: 'full',
        order: 0,
        arianeeLink: 'https://test.arianee.net/755679764,5w2y7zoxmk7n'
      },
      {
        type: 'full',
        order: 1,
        arianeeLink: 'https://test.arianee.net/857212492,1hkahyv4gj52' // proof || viewkey
        arianeeLink: jwt.ezfonzefezon.zefezf
      }
    ]
  };

  const { certificateId, passphrase, deepLink } = await wallet.methods.createAndStoreCertificate({
    content: content
  }, 'https://arianee.cleverapps.io/testnet/rpc');

  console.log(certificateId, passphrase, deepLink);

  const b = await wallet.methods.getCertificate(7305865, '', {
    content: true,
    events: true,
    arianeeEvents: true,

  });

  console.log(wallet.address)
  console.log(b.events.arianeeEvents);
  */
})();
