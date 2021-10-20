import { getRandomCharacter } from './randomCharacter';

describe('random', () => {
  test('random character', () => {
    const randomCharacter = getRandomCharacter();
    expect(randomCharacter).toBeDefined();
    expect(randomCharacter).toHaveLength(1);
  });
  test('random character letter only', () => {
    const randomCharacter = getRandomCharacter(true);
    expect(isNaN(+randomCharacter)).toBeTruthy();
    expect(randomCharacter).toHaveLength(1);
  });
});
