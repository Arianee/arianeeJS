import { Arianee, NETWORK } from '../../src';
import * as fs from 'fs';

(async function () {
  const originFile = fs.readFileSync(__dirname + '/../../../example/batchExample/cert-origin.csv', { encoding: 'utf8' });
  const data = originFile.split('\n');
  data.shift();
  const datamapped = data.map(row => {
    const data = row.replace('\r', '').split(';');
    if (data.length === 2) {
      return {
        uri: '',
        passphrase: data[0],
        content: JSON.parse(data[1])
      };
    }
  });
  const nbtx = datamapped.length;
  const txPerBatch = 15;
  const batchNb = Math.ceil(datamapped.length / txPerBatch);
  const batchParam = [];

  for (let i = 0; i < batchNb; i++) {
    if (i + 1 !== batchNb) {
      const splicedParam = datamapped.splice(0, txPerBatch);
      batchParam.push(splicedParam);
    } else {
      batchParam.push(datamapped);
    }
  }

  const arianee = await new Arianee().init(NETWORK.testnet);
  const wallet = arianee.fromPrivateKey('MYPRIVATEKEY'); // the key need enough POA
  await wallet.requestAria();

  // await wallet.methods.approveStore();
  await wallet.methods.buyCredits('certificate', nbtx, wallet.publicKey);

  for (let i = 0; i < batchParam.length; i++) {
    const batch = await wallet.methods.createCertificatesBatch(batchParam[i])
      .catch(err => {
        console.log('FAILED TRANSACTION');
        console.log(err);
      });
    console.log(batch);
  }

  console.log('END');
})();
