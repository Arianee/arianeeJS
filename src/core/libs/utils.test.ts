import { ServicesHub } from '../servicesHub';
import { Utils } from './utils';

describe("UTILS", () => {
  describe('readLink', () => {
    test('it should return passphrase and tokenId from link', () => {
      const servicesHubStub: ServicesHub = <ServicesHub>{
        arianeeConfig: {
          "deepLink": "test.arian.ee"
        }
      };
      const utils = new Utils(undefined, servicesHubStub);
      const tokenId = 1314;
      const passphrase = 'mypassaezfkzn';
      const linkObject = utils.readLink(`https://test.arian.ee/${tokenId},${passphrase}`);
      expect(linkObject).toEqual({
        tokenId, passphrase
      });
    });
    test('readlink should be linked with createLink', () => {
      const servicesHubStub: ServicesHub = <ServicesHub>{
        arianeeConfig: {
          "deepLink": "test.arian.ee"
        }
      };
      const utils = new Utils(undefined, servicesHubStub);
      const tokenId = 1314;
      const passphrase = 'mypassaezfkzn';
      const linkObject = utils.createLink(tokenId, passphrase);

      expect(linkObject.tokenId).toBe(tokenId);
      expect(linkObject.passphrase).toBe(passphrase);

      const transform2 = utils.readLink(linkObject.link);

      expect(transform2.tokenId).toBe(tokenId);
      expect(transform2.passphrase).toBe(passphrase);

    });
  });

  describe('isRightEnvironement', () => {
    test('it should return true if same chain as current wallet', () => {
      const servicesHubStub: ServicesHub = <ServicesHub>{
        arianeeConfig: {
          "deepLink": "test.arian.ee"
        }
      };
      const utils = new Utils(undefined, servicesHubStub);

      expect(utils.isRightChain('test.arian.ee')).toBe(true);
    });

    test('it should throw an error if wrong chain as current wallet', () => {
      const servicesHubStub: ServicesHub = <ServicesHub>{
        arianeeConfig: {
          "deepLink": "test.arian.ee"
        }
      };
      const utils = new Utils(undefined, servicesHubStub);

      try {
        utils.isRightChain('arian.ee');
        expect(true).toBe(false);
      } catch{
        expect(true).toBe(true);
      }
    });
  });

});