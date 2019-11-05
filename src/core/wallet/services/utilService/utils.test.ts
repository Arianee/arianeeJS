import { ConfigurationService } from '../configurationService/configurationService';
import { UtilsService } from './utilsService';

describe('UTILS', () => {
  describe('readLink', () => {
    test('it should return passphrase and certificateId from link', () => {
      const configurationServiceStub: ConfigurationService = <ConfigurationService>{
        arianeeConfiguration: {
          deepLink: 'test.arian.ee'
        }
      };
      const utils = new UtilsService(undefined, configurationServiceStub);

      const certificateId = 1314;
      const passphrase = 'mypassaezfkzn';
      const linkObject = utils.readLink(
        `https://test.arian.ee/${certificateId},${passphrase}`
      );
      expect(linkObject).toEqual({
        certificateId: certificateId,
        passphrase,
        method: 'requestOwnership'
      });
    });

    test('it should return passphrase and certificateId from link and proof method', () => {
      const configurationServiceStub: ConfigurationService = <ConfigurationService>{
        arianeeConfiguration: {
          deepLink: 'test.arian.ee'
        }
      };
      const utils = new UtilsService(undefined, configurationServiceStub);

      const certificateId = 1314;
      const passphrase = 'mypassaezfkzn';
      const linkObject = utils.readLink(
        `https://test.arian.ee/proof/${certificateId},${passphrase}`
      );
      expect(linkObject).toEqual({
        certificateId: certificateId,
        passphrase,
        method: 'proof'
      });
    });

    test('readlink should be linked with createLink', () => {
      const configurationServiceStub: ConfigurationService = <ConfigurationService>{
        arianeeConfiguration: {
          deepLink: 'test.arian.ee'
        }
      };
      const utils = new UtilsService(undefined, configurationServiceStub);

      const certificateId = 1314;
      const passphrase = 'mypassaezfkzn';
      const linkObject = utils.createLink(certificateId, passphrase);

      expect(linkObject.certificateId).toBe(certificateId);
      expect(linkObject.passphrase).toBe(passphrase);

      const transform2 = utils.readLink(linkObject.link);

      expect(transform2.certificateId).toBe(certificateId);
      expect(transform2.passphrase).toBe(passphrase);
    });
  });

  describe('isRightEnvironement', () => {
    test('it should return true if same chain as current wallet', () => {
      const configurationServiceStub: ConfigurationService = <ConfigurationService>{
        arianeeConfiguration: {
          deepLink: 'test.arian.ee'
        }
      };
      const utils = new UtilsService(undefined, configurationServiceStub);

      expect(utils.isRightChain('test.arian.ee')).toBe(true);
    });

    test('it should throw an error if wrong chain as current wallet', () => {
      const configurationServiceStub: ConfigurationService = <ConfigurationService>{
        arianeeConfiguration: {
          deepLink: 'test.arian.ee'
        }
      };
      const utils = new UtilsService(undefined, configurationServiceStub);

      try {
        utils.isRightChain('arian.ee');
        expect(true).toBe(false);
      } catch {
        expect(true).toBe(true);
      }
    });
  });

  describe('urlParse', () => {
    const utils = new UtilsService(undefined, undefined);

    test('it should parse complicated url', () => {
      const myURL =
        'http://username:password@localhost:257/deploy/?asd=asd#asd';

      const url = new URL(myURL);
      const parsedURL = utils.simplifiedParsedURL(myURL);

      expect(parsedURL.hostname).toBe(url.hostname);
      expect(parsedURL.hash).toBe(url.hash);
      expect(parsedURL.pathname).toBe(url.pathname);
      expect(parsedURL.port).toBe(url.port);
      expect(parsedURL.protocol).toBe(url.protocol);
      expect(parsedURL.search).toBe(url.search);
    });

    test('it should parse classic arianee url', () => {
      const myURL = 'https://test.arian.ee/722377,ivrsesj4c4nd';

      const parsedURL = utils.simplifiedParsedURL(myURL);
      const url = new URL(myURL);

      expect(parsedURL.hostname).toBe(url.hostname);
      expect(parsedURL.pathname).toBe(url.pathname);
      expect(parsedURL.protocol).toBe(url.protocol);
    });
  });

  describe('timestampIsMoreRecentThan', () => {
    const utils = new UtilsService(undefined, undefined);
    test('it should return true if timestamp is recent', () => {
      const testTimestamp = Math.round((new Date().valueOf() - 3000) / 1000); // now - 3 secondes (in seconds)
      const isRecent = utils.timestampIsMoreRecentThan(testTimestamp, 300); // test if timestamp is > (now - 3 minutes)

      expect(isRecent).toBe(true);
    });

    test('it should return false if timestamp is old', () => {
      const testTimestamp = Math.round(
        (new Date().valueOf() - 24 * 60 * 60 * 1000) / 1000
      ); // now - 1 day (in seconds)
      const isRecent = utils.timestampIsMoreRecentThan(testTimestamp, 300); // test if timestamp is > (now - 3 minutes)

      expect(isRecent).toBe(false);
    });
  });
});
