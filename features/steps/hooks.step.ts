import { AfterAll, Before, setDefaultTimeout } from "cucumber";
import { CCStore } from "./helpers/store";

setDefaultTimeout(60 * 2 * 1000);

Before(function () {
    this.store = new CCStore();
});

AfterAll(() => {
});