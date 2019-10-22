import { NETWORK, networkURL } from "../../models/networkConfiguration";
import { Arianee } from "./arianee";
const myFetchMock = jest.fn();
import appConfigurations from "../../configurations/appConfigurations";

jest.mock("../servicesHub/services/arianeeHttpClient", () => ({
  ArianeeHttpClient: class ArianeeHttpClientStub {
    public fetch = ArianeeHttpClientStub.fetch;

    public static fetch = url => {
      myFetchMock(url);

      return {
        contractAdresses: {
          aria: "0xB81AFe27c103bcd42f4026CF719AF6D802928765",
          creditHistory: "0x9C868D9bf85CA649f219204D16d99A240cB1F011",
          eventArianee: "0x8e8de8fe625c376f6d4fb2fc351337268a73388b",
          identity: "0x74a13bF9eFcD1845E5A2e932849094585AA3BCF9",
          smartAsset: "0x512C1FCF401133680f373a386F3f752b98070BC5",
          staking: "0x3a125be5bb8a3e1c171947c384795b4a488b74a0",
          store: "0x4f001a00034e0d823c30819166dea654cd8b1939",
          whitelist: "0x3579669219DC20Aa79E74eEFD5fB2EcB0CE5fE0D"
        },
        httpProvider: "https://sokol.poa.network",
        chainId: 77
      };
    }
  }
}));

describe("Arianee", () => {
  describe("CONFIGURATION", () => {
    describe("testnet", () => {
      test("should be fetching testnet addresses", async () => {
        await new Arianee().connectToProtocol(NETWORK.testnet);
        expect(myFetchMock).toHaveBeenCalledWith(networkURL.testnet);
      });
      test("should be fetching testnet config", async () => {
        const arianee = await new Arianee().connectToProtocol(NETWORK.testnet);
        const {
          deepLink,
          faucetUrl
        } = arianee.fromRandomKey().servicesHub.arianeeConfig;
        expect(deepLink).toBe(appConfigurations.testnet.deepLink);
        expect(faucetUrl).toBe(appConfigurations.testnet.faucetUrl);
      });
    });
    describe("mainet", () => {
      test("should be fetching testnet addresses", async () => {
        await new Arianee().connectToProtocol(NETWORK.mainnet);
        expect(myFetchMock).toHaveBeenCalledWith(networkURL.mainnet);
      });

      test("should be fetching testnet config", async () => {
        const arianee = await new Arianee().connectToProtocol(NETWORK.mainnet);
        const {
          deepLink,
          faucetUrl
        } = arianee.fromRandomKey().servicesHub.arianeeConfig;
        expect(deepLink).toBe(appConfigurations.mainnet.deepLink);
        expect(faucetUrl).toBe(appConfigurations.mainnet.faucetUrl);
      });
    });
  });
});
