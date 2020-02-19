import { isPrivateKeyValid } from './isPrivateKeyValid';

describe('PrivateKeyValidator', () => {
  test('should be accepted private key', async () => {
    const privateKey = '0x0000000000000000000000000000000000000000000070617373706872617365';
    expect(isPrivateKeyValid(privateKey)).toBeTruthy();
  });

  test('should be not accepted private key do not starts with 0X', async () => {
    const privateKey = '000000000000000000000000000000000000000000000070617373706872617365';
    expect(isPrivateKeyValid(privateKey)).toBeFalsy();
  });
  test('should be not accepted private key if not 64/66 chars', async () => {
    const privateKey = '0x0000000000000070617373706872617365';
    expect(isPrivateKeyValid(privateKey)).toBeFalsy();
  });
});
