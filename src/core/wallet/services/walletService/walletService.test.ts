import Web3 from 'web3';
import { WalletService } from './walletService';

describe('WalletService', () => {
  describe('sign', () => {
    const expectedTransaction = {
      message:
          '0xb5aaa9d50000000000000000000000000000000000000000000000000000000036cbd885',
      signature:
          '0x683efd7ea70b8905d791d874e86f8efebc10de34c731d67353c71ce5bf25f7cd62f06c17ac048c3ab25e0e5e6b4e91266cab6c60341fc36b97c4864e81e1b2e71b',
      messageHash:
          '0x6e032a39ca0ba9dc454bfe3eaebd1ae953af40ead4e33e227aa5000d74448a28'
    };

    const walletPK = '0xb0ba4db09ac19b27a184b4f68d26427d53256f4a92b1617c86fa44100d90d7de';
    const walletAddress = '0x95dad62BE58F8e632ff64830D843Ea18b6992f3f';
    const dataToSign = '0xb5aaa9d50000000000000000000000000000000000000000000000000000000036cbd885';

    test('userCustomSign', async () => {
      const walletService = new WalletService({ web3: new Web3() } as any,
          {
            arianeeConfiguration: {
              chainId: 77,
              networkName: 'testnet'
            }
          }as any
      );

      walletService.account = {
        address: walletAddress
      };

      walletService.userCustomSign = () => {
        return Promise.resolve(expectedTransaction);
      };

      const data = await walletService.sign(
        dataToSign
      );

      expect(walletService.isRemoteAccount()).toBeFalsy();
      expect(data).toEqual(expectedTransaction);
    });

    test('private key', async () => {
      const walletService = new WalletService({ web3: new Web3() } as any,
        {
          arianeeConfiguration: {
            chainId: 77,
            networkName: 'testnet'
          }
        }as any
      );

      const data = await walletService.sign(
        dataToSign,
        walletPK
      );

      expect(data).toEqual(expectedTransaction);
    });

    test('isRemoteAccount', async () => {
      // this.web3Service.web3.eth.personal.sign(<string>data, this.address)
      const walletService = new WalletService({
        web3: {
          eth: {
            accounts: {
              hashMessage: new Web3().eth.accounts.hashMessage
            },
            personal: {
              sign: (data, address) => Promise.resolve(expectedTransaction.signature)
            }
          }
        }
      } as any,
          {
            arianeeConfiguration: {
              chainId: 77,
              networkName: 'testnet'
            }
          }as any
      );

      walletService.account = {
        address: walletAddress
      };

      const data = await walletService.sign(
        dataToSign
      );

      expect(walletService.isRemoteAccount()).toBeTruthy();
      expect(data).toEqual(expectedTransaction);
    });

    test('metamask', async () => {
      // this.web3Service.web3.eth.personal.sign(<string>data, this.address)
      const walletService = new WalletService({
        web3: new Web3()
      } as any,
          {
            arianeeConfiguration: {
              chainId: 77,
              networkName: 'testnet'
            }
          }as any
      );

      walletService.metamask = true;
      Object.defineProperty(global, 'window', {
        // @ts-ignore
        value: {
          ethereum: {
            request: () => Promise.resolve(expectedTransaction.signature)
          }
        }
      });

      walletService.account = {
        address: walletAddress
      };

      const data = await walletService.sign(
        dataToSign
      );

      expect(walletService.isRemoteAccount()).toBeFalsy();
      expect(data).toEqual(expectedTransaction);
    });
  });
});
