import { AfterAll, Before } from "cucumber";
import { CCStore } from "./helpers/store";

var { setDefaultTimeout } = require('cucumber');

setDefaultTimeout(60 * 2 * 1000);

Before(function () {
    this.store = new CCStore();
});

AfterAll(() => {
})