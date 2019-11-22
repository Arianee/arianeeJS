import { singleton } from 'tsyringe';
import EventEmitter from 'eventemitter3';

export class CustomEventEmitter extends EventEmitter {
  on (...args) {
    if (args[0] !== 'newListener') {
      super.emit('newListener', args[0]);
    }

    // @ts-ignore
    return super.on(...args);
  }

  addListener=this.on;
}

@singleton()
export class ArianeeEventEmitter {
  public EE = new CustomEventEmitter();
}
