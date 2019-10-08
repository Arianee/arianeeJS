import * as configEnv from "../../configuration/dev";
import { ArianeeFactory } from "../arianeeFactory";
import { enableDev } from "./enableDevMode";

describe("arianee builder", () => {
    test("it should override dev mode", () => {
        const arieDev = ArianeeFactory(enableDev());
        const tokenAddress=arieDev.stateBuilder.build().arianeeConfig.token.address;
        const devTokenAddress = configEnv.arianJSON.token.address;
        expect(tokenAddress).toBe(devTokenAddress);
    });
});
