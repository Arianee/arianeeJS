# ArianeeJS

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.


### Get ready : installation

Get the last version from NPM or your favorite registry:
```
npm i arianee-js-sdk
```

or directly from github :

```
npm i git+https://git@github.com/stefdelec/arianeeJS.git

```
### Simple example

In this example, we will create a arianee wallet and get its POA balance. Of course it will be 0.

```
import { Arie } from ('arianee-js-sdk');

const balance= awaitArie()
    .fromRandomKey()
    .buildAriaWallet()
    .balance
    .current()

// output 0
```

Other examples can be found in folder ``examples`` :
- [angular service example](examples/angular-example.ts)
- [enable dev mode](examples/enable-dev-mode.js)

## Running the tests

To assure quality and bug free code, we use e2e tests plugged with cucumber and unit testing.

```
npm test
```

### End to end test

```
npm run test:e2e
```

### unit test

```
npm run test:unit
```
