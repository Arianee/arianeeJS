require('reflect-metadata');
require('promise.prototype.finally').shim();

const isNodeVersion8 = +process.version.match(/^v(\d)+\.\d+/)[1] === 8;

if (isNodeVersion8) {
  const URL = require('url').URL;
  global.URL = URL;
}
