import { Store } from './store';

describe('store', () => {
  it('should store a value', async () => {
    const store = new Store();
    await store.setStoreItem('key1', 'value1');
    const result = await store.getStoreItem('key1');

    expect(result).toBe('value1');
  });

  it('should set if an item is set', async () => {
    const store = new Store();
    await store.setStoreItem('key1', 'value1');
    const result = await store.hasItem('key1');

    expect(result).toBe(true);
  });
});
