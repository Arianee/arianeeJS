import { TransactionMapper } from './TransactionMapper';

describe('TransactionMapper', () => {
  const etherjsTx = {
    nonce: '0x00',
    gasPrice: '0x3b9aca00',
    gasLimit: '0x1e8480',
    to: '0xB81AFe27c103bcd42f4026CF719AF6D802928765',
    chainId: 77,
    data: '0x095ea7b300000000000000000000000082890cedcb8eb0cdc229ac7b8fdd39f93700c8540000000000000000000000000000000000000000204fce5e3e25026110000000'

  };

  const web3Tx = {
    nonce: 0,
    chainId: 77,
    data:
            '0x095ea7b300000000000000000000000082890cedcb8eb0cdc229ac7b8fdd39f93700c8540000000000000000000000000000000000000000204fce5e3e25026110000000',
    to: '0xB81AFe27c103bcd42f4026CF719AF6D802928765',
    gas: 2000000,
    gasPrice: 1000000000
  };
  describe('from web3', () => {
    const tm = new TransactionMapper(web3Tx);
    test('it should output web3', () => {
      expect(tm.toWeb3()).toEqual({
        nonce: 0,
        gasPrice: 1000000000,
        to: '0xB81AFe27c103bcd42f4026CF719AF6D802928765',
        chainId: 77,
        data:
                '0x095ea7b300000000000000000000000082890cedcb8eb0cdc229ac7b8fdd39f93700c8540000000000000000000000000000000000000000204fce5e3e25026110000000',
        gas: 2000000
      }
      );
    });
    test('it should output etherjs', () => {
      expect(tm.toEtherjs()).toEqual({
        nonce: 0,
        gasPrice: '0x3b9aca00',
        to: '0xB81AFe27c103bcd42f4026CF719AF6D802928765',
        value: undefined,
        chainId: 77,
        data:
              '0x095ea7b300000000000000000000000082890cedcb8eb0cdc229ac7b8fdd39f93700c8540000000000000000000000000000000000000000204fce5e3e25026110000000',
        gasLimit: '0x1e8480'
      }

      );
    });
    test('it should output toEthereumjs', () => {
      expect(tm.toEthereumjs()).toEqual({
        nonce: '0x00',
        gasPrice: '0x3b9aca00',
        to: '0xB81AFe27c103bcd42f4026CF719AF6D802928765',
        value: undefined,
        chainId: 77,
        data: web3Tx.data,
        gasLimit: '0x1e8480'
      }
      );
    });
  });

  describe('from etherjsTx', () => {
    const tm = new TransactionMapper(etherjsTx);
    test('it should output web3', () => {
      expect(tm.toWeb3()).toEqual({
        nonce: 0,
        gasPrice: 1000000000,
        to: '0xB81AFe27c103bcd42f4026CF719AF6D802928765',
        chainId: 77,
        data:
                '0x095ea7b300000000000000000000000082890cedcb8eb0cdc229ac7b8fdd39f93700c8540000000000000000000000000000000000000000204fce5e3e25026110000000',
        gas: 2000000
      }
      );
    });
    test('it should output etherjs', () => {
      expect(tm.toEtherjs()).toEqual({
        nonce: 0,
        gasPrice: '0x3b9aca00',
        to: '0xB81AFe27c103bcd42f4026CF719AF6D802928765',
        value: undefined,
        chainId: 77,
        data:
                '0x095ea7b300000000000000000000000082890cedcb8eb0cdc229ac7b8fdd39f93700c8540000000000000000000000000000000000000000204fce5e3e25026110000000',
        gasLimit: '0x1e8480'
      }

      );
    });
    test('it should output toEthereumjs', () => {
      expect(tm.toEthereumjs()).toEqual({
        nonce: '0x00',
        gasPrice: '0x3b9aca00',
        to: '0xB81AFe27c103bcd42f4026CF719AF6D802928765',
        value: undefined,
        chainId: 77,
        data: web3Tx.data,
        gasLimit: '0x1e8480'
      }
      );
    });
  });
});
