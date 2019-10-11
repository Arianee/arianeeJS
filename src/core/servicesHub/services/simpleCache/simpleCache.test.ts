import { SimpleCache } from './simpleCache';

describe('httpCache', () => {
    const values = ['efezfze', 22, { john: 'zefezf', fez: { 'zef': 22 } }];

    test("should set and get for string", async () => {
        const key = 'myKey';
        const value = 'myValue';
        const cache = new SimpleCache();
        await cache.set(key, value);
        const myCacheValue = await cache.get(key);
        expect(myCacheValue).toBe(value);
    });

    test('should set and get multiple values', async () => {
        const cache = new SimpleCache();

        await Promise.all(values.map((value, index) => cache.set(index.toString(), value)));
        const arrayOfValues  = await Promise.all(values.map((value, index) => cache.get(index.toString())));

        expect(arrayOfValues.sort()).toEqual(values.sort());

    });

    test('should override when already set', async () => {
        const key = 'myKey';
        const value = 'myValue';
        const value2 = 'myValue2';
        const cache = new SimpleCache();

        await cache.set(key, value);
        await cache.set(key, value2);

        const myCacheValue = await cache.get(key);
        expect(myCacheValue).toBe(value2);
    });
});