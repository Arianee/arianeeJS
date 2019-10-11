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

  describe("urlParse", () => {
    const utils = new Utils(undefined, undefined);
    test('it should parse complicated url', () => {
      const myURL="http://username:password@localhost:257/deploy/?asd=asd#asd";

      const url=new URL(myURL);
      const parsedURL = utils.simplifiedParsedURL(myURL);

      expect(parsedURL.hostname).toBe(url.hostname);
      expect(parsedURL.hash).toBe(url.hash);
      expect(parsedURL.pathname).toBe(url.pathname);
      expect(parsedURL.port).toBe(url.port);
      expect(parsedURL.protocol).toBe(url.protocol);
      expect(parsedURL.search).toBe(url.search);
    });

    test('it should parse classic arianee url', () => {
      
      const myURL="https://test.arian.ee/722377,ivrsesj4c4nd";

      const parsedURL = utils.simplifiedParsedURL(myURL);
      const url=new URL(myURL);

      expect(parsedURL.hostname).toBe(url.hostname);
      expect(parsedURL.pathname).toBe(url.pathname);
      expect(parsedURL.protocol).toBe(url.protocol);
    });

  });
});
