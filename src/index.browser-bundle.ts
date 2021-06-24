(window as any).global = window;
global.Buffer = global.Buffer || require('buffer').Buffer;
(window as any).process = {
  version: ''
};
import 'regenerator-runtime/runtime';
import { Arianee } from './core/arianee';
import { NETWORK } from './models/networkConfiguration';
import './polyfills';

export { Arianee, NETWORK };
export default Arianee;

