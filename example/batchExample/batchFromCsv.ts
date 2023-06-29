import { Arianee, NETWORK } from '../../src';
import * as fs from 'fs';
import axios from 'axios';

const rpcurl = ''; // JSON RPC URL
const privateKey = ''; // Private key with enough POA and Aria

const parseCsv = (csvPath) => {
  const originFile = fs.readFileSync(csvPath, { encoding: 'utf8' });
  const data = originFile.split('\n');
  data.shift();
  return data.map(row => {
    const data = row.replace('\r', '').split(';');
    if (data.length === 3) {
      return {
        uri: '',
        certificateId: data[0],
        passphrase: data[1],
        content: JSON.parse(data[2])
      };
    }
  });
};

const storeJsonContent = async (url) => {
  const arianee = await new Arianee().init(NETWORK.testnet);
  const wallet = arianee.fromRandomKey();
  const datamapped = parseCsv(__dirname + '/../../../example/batchExample/cert-origin.csv');
  for (let i = 0; i < datamapped.length; i++) {
    if (datamapped[i]) {
      await wallet.methods.storeContentInRPCServer(datamapped[i].certificateId, datamapped[i].content, url + '/rpc');
      await axios.post(url + '/wallet/certificate/' + datamapped[i].certificateId + '/passphrase', { passphrase: datamapped[i].passphrase });
    }
  }
  console.log('STORED');
};

const checkIdsAvailablity = async (ids) => {
  const arianee = await new Arianee().init(NETWORK.testnet);
  const wallet = arianee.fromRandomKey();

  return Promise.all(ids.map(id => {
    return new Promise((resolve, reject) => {
      wallet.contracts.smartAssetContract.methods.ownerOf(id).call()
        .then(() => { reject('ID ' + id + ' is not available'); })
        .catch(err => { resolve(true); });
    });
  }));
};

const createCertificateInBatch = async (datamapped) => {
  const nbtx = datamapped.length;
  const txPerBatch = 8;
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
  const wallet = arianee.fromPrivateKey(privateKey); // the key need enough POA

  await wallet.requestAria();
  await wallet.methods.approveStore();
  await wallet.methods.buyCredits('certificate', nbtx, wallet.address);

  for (let i = 0; i < batchParam.length; i++) {
    const batch = await wallet.methods.createCertificatesBatch(batchParam[i])
      .catch(err => {
        console.log('FAILED TRANSACTION');
        console.log(err);
      });
    console.log(batch);
    if (i === batchParam.length - 1) {
      await storeJsonContent(rpcurl);
    }
  }
};

(async function () {
  const datamapped = parseCsv(__dirname + '/../../../example/batchExample/cert-origin.csv');
  const ids = datamapped.map(value => { if (value) { return value.certificateId; } });
  try {
    await checkIdsAvailablity(ids);
    await createCertificateInBatch(datamapped);
  } catch {
    console.log('one or more ids are not available');
  }

  console.log('END');
})();
