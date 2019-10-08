import { Given, Then, When } from "cucumber";
import { expect } from "chai";
import { Arianee, enableDev } from "../../src";
import * as configEnv from "../../src/configuration/dev";

Given('Developer activate test mode', function () {
    this.arianee = Arianee(enableDev());
    return;
});

Then('developer has test config', function () {
    const devTokenAddress = configEnv.arianJSON.token.address;
    expect(this.arianee.tokenAddress).equals(devTokenAddress);
});

