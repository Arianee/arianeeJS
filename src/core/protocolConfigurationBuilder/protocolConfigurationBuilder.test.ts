import { ProtocolConfigurationBuilder } from "./protocolConfigurationBuilder";

describe("arianee builder", () => {
    test("it should not build before all properties are checked", () => {
        const i = new ProtocolConfigurationBuilder()
            .isReadyForBuild()
            .isValid;

        expect(i).toBe(false);
    });
    test("it should  build if all properties are checked", () => {

        const i = new ProtocolConfigurationBuilder()
        .setAria({})
        .setIdentityAbi({})
        .setStoreAbi({})
        .setTokenAbi({})
        .setCreditHistory({})
        .setStaking({})
        .setWhiteList({})
        .isReadyForBuild()
            .isValid;

        expect(i).toBe(true);

    });
});
