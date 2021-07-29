import { deepFreeze } from './deepFreeze';

describe('deepFreeze', () => {
  test('it should freeze object', () => {
    const obj = deepFreeze({
      name: 'john'
    });
    try {
      obj.name = 'paul';
    } catch (e) {

    }
    expect(obj.name).toBe('john');
  });
  test('it should deep freeze object', () => {
    const obj = deepFreeze({
      john: {
        name: 'john'
      }
    });
    try {
      obj.john.name = 'paul';
    } catch (e) {

    }
    expect(obj.john.name).toBe('john');
  });
});
