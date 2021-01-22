import { JWTGeneric } from './JWTGeneric';

const Web3 = require('web3');

describe('JWTGeneric', function () {
  const pubKey = '0x74FE09Db23Df5c35d2969B666f7AA94621E11D30';
  const privateKey = '0x14a99f4c1f00982e9f3762c9abaf88b30e9f3e6bb8b89bc99ecb76e1cd7a6538';

  const signer = (data) => new Web3().eth.accounts.sign(data, privateKey).signature;
  const decoder = (message, signature) => new Web3().eth.accounts.recover(message, signature);

  const payload = {
    userId: '1101001',
    name: 'John Doe'
  };
  const expectedToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJFVEgifQ==.eyJ1c2VySWQiOiIxMTAxMDAxIiwibmFtZSI6IkpvaG4gRG9lIn0=.0xaa8b8f783731be8460927145d9f0f53bd83715dead3a39c9e68d8e3c4c7644d0045a6b75ec80ad39de664542210e2d97fe485a7aa0647dfdf93ba91443c8c03d1b';

  describe('basic methods', () => {
    test('it should create a token', async () => {
      const jwt = new JWTGeneric(signer, decoder as any);

      const jwtService = await jwt.setPayload(payload);
      const token = await jwtService.sign();

      expect(token).toBe(expectedToken);
    });

    test('it should decode a token', () => {
      const jwt = new JWTGeneric(signer, decoder as any);

      const decodedToken = jwt
        .setToken(expectedToken)
        .decode();

      expect(decodedToken.payload).toEqual(payload);
    });

    test('it should verify a wrong pubKey and say false', () => {
      const jwt = new JWTGeneric(signer, decoder as any);

      const isAuthentic = jwt
        .setToken(expectedToken)
        .verify('0x74FE09Db23Df5c35d2969B666f7AA94621E110');

      expect(isAuthentic).toBeFalsy();
    });

    test('it should verify the right pubkey and say true', () => {
      const jwt = new JWTGeneric(signer, decoder as any);

      const isAuthentic = jwt
        .setToken(expectedToken)
        .verify(pubKey);

      expect(isAuthentic).toBeTruthy();
    });
  });

  describe('verify methods', () => {
    describe('exp', () => {
      test('it should be false if expired', async () => {
        const jwt = new JWTGeneric(signer, decoder as any);
        const now = Date.now();
        var exp = new Date();
        exp.setMinutes(exp.getMinutes() - 5);
        const payload = {
          userId: '1101001',
          name: 'John Doe',
          exp: exp.getTime()
        };

        const jwtService = await jwt.setPayload(payload);
        const token = await jwtService.sign();

        const isAuthentic = jwt
          .setToken(token)
          .verify(pubKey);

        expect(isAuthentic).toBeFalsy();
      });
      test('it should be true if not expired', async () => {
        const jwt = new JWTGeneric(signer, decoder as any);
        var exp = new Date();
        exp.setMinutes(exp.getMinutes() + 5);
        const payload = {
          userId: '1101001',
          name: 'John Doe',
          exp: exp.getTime()
        };

        const jwtService = await jwt.setPayload(payload);
        const token = await jwtService.sign();

        const isAuthentic = jwt
          .setToken(token)
          .verify(pubKey);

        expect(isAuthentic).toBeTruthy();
      });
    });
    describe('nbf', () => {
      test('it should be false if before nbf', async () => {
        const jwt = new JWTGeneric(signer, decoder as any);
        var nbf = new Date();
        nbf.setMinutes(nbf.getMinutes() + 5);
        const payload = {
          userId: '1101001',
          name: 'John Doe',
          nbf: nbf.getTime()
        };

        const jwtService = await jwt.setPayload(payload);
        const token = await jwtService.sign();

        const isAuthentic = jwt
          .setToken(token)
          .verify(pubKey);

        expect(isAuthentic).toBeFalsy();
      });
      test('it should be true if after nbf', async () => {
        const jwt = new JWTGeneric(signer, decoder as any);
        var nbf = new Date();
        nbf.setMinutes(nbf.getMinutes() - 5);
        const payload = {
          userId: '1101001',
          name: 'John Doe',
          nbf: nbf.getTime()
        };

        const jwtService = await jwt.setPayload(payload);
        const token = await jwtService.sign();

        const isAuthentic = jwt
          .setToken(token)
          .verify(pubKey);

        expect(isAuthentic).toBeTruthy();
      });
    });

    test('it should verify a token and say true', () => {
      const jwt = new JWTGeneric(signer, decoder as any);

      const isAuthentic = jwt
        .setToken(expectedToken)
        .verify(pubKey);

      expect(isAuthentic).toBeTruthy();
    });
  });
});
