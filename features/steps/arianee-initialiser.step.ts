import { Given } from 'cucumber';
import { Arianee } from '../../src';
import { NETWORK } from '../../src/models/networkConfiguration';

Given('arianee is on {word}', async function (environment) {
  if (!NETWORK.hasOwnProperty(environment)) {
    throw new Error('this method to create a account is not supported');
  }

  const arianee = await new Arianee().init(NETWORK[environment]);
});
