import { isAlreadyKnown, isAlreadyTxWithSameNonce, isErrorInstance, isNonceTooLow } from './errorhelper';

describe('error helper', () => {
  test('is error instance', () => {
    expect(isErrorInstance({ message: 'hey' })).toBe(true);
    expect(isErrorInstance({ error: { message: 'hey' } })).toBe(true);
    expect(isErrorInstance(new Error('hey'))).toBe(true);
  });

  describe('isAlreadyKnown', () => {
    describe('testnet and mainnet', () => {
      test('should be true if includes already known', () => {
        expect(isAlreadyKnown({ message: 'efzef AlreadyKnown' })).toBe(true);
      });
      test('should be false if not', () => {
        expect(isAlreadyKnown({ message: 'efzef zefzefez' })).toBe(false);
      });
    });
  });

  describe('isNonceTooLow', () => {
    describe('testnet and mainnet', () => {
      test('should be true if includes already known', () => {
        expect(isNonceTooLow({ message: 'zef OldNonce zfzef' })).toBe(true);
      });
      test('should be false if not', () => {
        expect(isNonceTooLow({ message: 'efzef zefzefez' })).toBe(false);
      });
    });
  });

  describe('isAlreadyTxWithSameNonce', () => {
    describe('testnet and mainnet', () => {
      test('should be true if includes already known', () => {
        expect(isAlreadyTxWithSameNonce({ message: 'zef FeeTooLowToCompete zfzef' })).toBe(true);
      });
      test('should be false if not', () => {
        expect(isAlreadyTxWithSameNonce({ message: 'efzef zefzefez' })).toBe(false);
      });
    });
  });
});
