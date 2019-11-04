import { Given } from 'cucumber';
import { Arianee } from '../../src';
import { NETWORK } from '../../src/models/networkConfiguration';

Given('arianee is on {word}', async function (environment) {
  if (!Object.prototype.hasOwnProperty.call(NETWORK, environment)) {
    throw new Error('this method to create a account is not supported');
  }

  const arianee = await new Arianee().init(NETWORK[environment]);
});
