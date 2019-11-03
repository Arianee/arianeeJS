[![Build Status](https://travis-ci.org/Arianee/arianeeJS.svg?branch=master)](https://travis-ci.org/Arianee/arianeeJS)
[![npm version](https://img.shields.io/npm/v/@arianee/arianeejs.svg?style=flat)](https://www.npmjs.com/package/@arianee/arianeejs)

# ArianeeJS


## Getting Started

The full doc is avalaible here: https://docs.arianee.org/docs/ArianeeJS
 
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

## Contributing

Your contribution are welcome if they comply to the following requirements:

 1. Commit name should follow this specification [https://www.conventionalcommits.org/en/v1.0.0-beta.2/#summary](https://www.conventionalcommits.org/en/v1.0.0-beta.2/#summary)
 2. All tests should be ok
 3. Add value to the product
