import { CacheManager } from '../src/core/CacheManager';
import { MemoryEngine } from '../src/engine/MemoryEngine';
import { createCache } from '../src/index';

describe('CacheManager', () => {
  let cache: CacheManager;

  beforeEach(() => {
    cache = new CacheManager(new MemoryEngine());
  });

  it('should set and get objects', async () => {
    const user = { id: 1, name: 'John' };
    await cache.set('user', user);
    const result = await cache.get<typeof user>('user');
    expect(result).toEqual(user);
  });

  it('should handle namespaces', async () => {
    const cache1 = new CacheManager(new MemoryEngine(), { namespace: 'app1' });
    const cache2 = new CacheManager(new MemoryEngine(), { namespace: 'app2' });
    
    await cache1.set('key', 'value1');
    await cache2.set('key', 'value2');
    
    expect(await cache1.get('key')).toBe('value1');
    expect(await cache2.get('key')).toBe('value2');
  });

  it('should remove values', async () => {
    await cache.set('key', 'value');
    await cache.remove('key');
    const result = await cache.get('key');
    expect(result).toBeNull();
  });

  it('should clear all values', async () => {
    await cache.set('key1', 'value1');
    await cache.set('key2', 'value2');
    await cache.clear();
    expect(await cache.get('key1')).toBeNull();
    expect(await cache.get('key2')).toBeNull();
  });
});

describe('createCache', () => {
  it('should create cache with memory backend by default', () => {
    const cache = createCache();
    expect(cache).toBeInstanceOf(CacheManager);
  });

  it('should create cache with specified backend', () => {
    const cache = createCache({ backend: 'local' });
    expect(cache).toBeInstanceOf(CacheManager);
  });
});