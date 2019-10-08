import { CCStore } from "./helpers/store";
import { Before, AfterAll } from "cucumber"

var { setDefaultTimeout } = require('cucumber');

setDefaultTimeout(60 * 2 * 1000);

Before(function () {
    this.store = new CCStore();
});

AfterAll(() => {
})