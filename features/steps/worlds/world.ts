import {CCStore} from "../helpers/store";

declare module "cucumber" {
    interface World {
        store: CCStore;
    }
}
