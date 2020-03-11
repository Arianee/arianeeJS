import { isNullOrUndefined } from './isNullOrUndefined';

describe('isNullOrUndefined', () => {
  test('should return false for false', () => {
    expect(isNullOrUndefined(false)).toBe(false);
  });
  test('should return false for true', () => {
    expect(isNullOrUndefined(true)).toBe(false);
  });
  test('should return false for a string', () => {
    expect(isNullOrUndefined('aString')).toBe(false);
  });
  test('should return false for a object', () => {
    expect(isNullOrUndefined({})).toBe(false);
  });
  test('should return true for undefined', () => {
    expect(isNullOrUndefined(undefined)).toBe(true);
  });
  test('should return null for undefined', () => {
    expect(isNullOrUndefined(null)).toBe(true);
  });
});
