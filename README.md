[![Build Status](https://travis-ci.org/Arianee/arianeeJS.svg?branch=master)](https://travis-ci.org/Arianee/arianeeJS)
[![npm version](https://img.shields.io/npm/v/@arianee/arianeejs.svg?style=flat)](https://www.npmjs.com/package/@arianee/arianeejs)

# ArianeeJS


## Getting Started

The full doc is avalaible here: https://docs.arianee.org/docs/arianee-js
 
### Get ready : installation
  
  Get the last version from NPM or your favorite registry:

````sh
npm i @arianee/arianeejs -D
````

### Simple example

```javascript
import { Arianee } from '@arianee/arianeejs'

(async function () {

  // By default Arianee will be initialized on testnet network
  const arianee = await new Arianee().init();

// Create a wallet
  const wallet = arianee.fromRandomKey();

// Request POA and Aria and approves store to make transaction on blockchain
  await wallet.requestPoa();
  await wallet.requestAria();

  await wallet.methods.approveStore();

  const balanceOfPoa = await wallet.methods.balanceOfPoa();
  console.log('balanceOfPoa: ', balanceOfPoa);

});
```  

## Issues

If you have an issue or you found a bug, please open an issue on our github repo: https://github.com/Arianee/arianeeJS/issues
Try to give us piece of code and the most details you can so we can reproduce your issue easily, and the help you faster.

## Contributing

Your contribution are welcome if they comply to the following requirements:

 1. Commit name should follow this specification [https://www.conventionalcommits.org/en/v1.0.0-beta.2/#summary](https://www.conventionalcommits.org/en/v1.0.0-beta.2/#summary)
 2. All tests should be ok
 3. Add value to the product
