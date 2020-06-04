import { injectable, singleton } from 'tsyringe';
import EventEmitter from 'eventemitter3';

export const enum ArianeListenerEvent {
  newListener='newListener'
}
export class CustomEventEmitter extends EventEmitter {
  on (...args) {
    if (args[0] !== ArianeListenerEvent.newListener) {
      super.emit(ArianeListenerEvent.newListener, args[0]);
    }

    // @ts-ignore
    return super.on(...args);
  }

  addListener=this.on;
}

@injectable()
export class ArianeeEventEmitter {
  public EE = new CustomEventEmitter();
}
