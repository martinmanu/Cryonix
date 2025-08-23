import { CacheManager } from '../src/core/CacheManager';
import { MemoryEngine } from '../src/engine/MemoryEngine';
import { createCache } from '../src/index';

describe('TTL Functionality', () => {
  let cache: CacheManager;

  beforeEach(() => {
    cache = new CacheManager(new MemoryEngine(), { ttl: 1 }); // 1 second default TTL
  });

  it('should store and retrieve data within TTL', async () => {
    await cache.set('key1', 'value1');
    const result = await cache.get('key1');
    expect(result).toBe('value1');
  });

  it('should return null for expired data', async () => {
    await cache.set('key1', 'value1', { ttl: 0.1 }); // 100ms TTL
    
    // Wait for expiration
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const result = await cache.get('key1');
    expect(result).toBeNull();
  });

  it('should use default TTL when no TTL specified', async () => {
    await cache.set('key1', 'value1'); // Uses default 1 second TTL
    
    // Should still be available immediately
    const result1 = await cache.get('key1');
    expect(result1).toBe('value1');
    
    // Wait for expiration
    await new Promise(resolve => setTimeout(resolve, 1100));
    
    const result2 = await cache.get('key1');
    expect(result2).toBeNull();
  });

  it('should override default TTL with per-operation TTL', async () => {
    await cache.set('key1', 'value1', { ttl: 0.1 }); // Override with 100ms
    
    // Wait for expiration
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const result = await cache.get('key1');
    expect(result).toBeNull();
  });

  it('should handle data without TTL (permanent)', async () => {
    const permanentCache = new CacheManager(new MemoryEngine()); // No default TTL
    
    await permanentCache.set('key1', 'value1'); // No TTL
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const result = await permanentCache.get('key1');
    expect(result).toBe('value1');
  });

  it('should cleanup expired items', async () => {
    await cache.set('key1', 'value1', { ttl: 0.1 });
    await cache.set('key2', 'value2', { ttl: 0.1 });
    await cache.set('key3', 'value3'); // Uses default TTL (1 second)
    
    // Wait for first two to expire
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const cleanedCount = await cache.cleanupExpired();
    expect(cleanedCount).toBe(2);
    
    // key3 should still exist
    const result = await cache.get('key3');
    expect(result).toBe('value3');
  });

  it('should handle complex objects with TTL', async () => {
    const complexObject = {
      user: { id: 1, name: 'John' },
      settings: { theme: 'dark' },
      array: [1, 2, 3]
    };
    
    await cache.set('complex', complexObject, { ttl: 0.2 });
    
    const result1 = await cache.get('complex');
    expect(result1).toEqual(complexObject);
    
    // Wait for expiration
    await new Promise(resolve => setTimeout(resolve, 250));
    
    const result2 = await cache.get('complex');
    expect(result2).toBeNull();
  });
});

describe('TTL with createCache', () => {
  it('should support TTL in createCache options', async () => {
    const cache = createCache({
      backend: 'memory',
      ttl: 0.1 // 100ms default TTL
    });
    
    await cache.set('key1', 'value1');
    
    const result1 = await cache.get('key1');
    expect(result1).toBe('value1');
    
    // Wait for expiration
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const result2 = await cache.get('key1');
    expect(result2).toBeNull();
  });

  it('should support TTL with encryption', async () => {
    const cache = createCache({
      backend: 'memory',
      ttl: 0.1,
      secure: true,
      secret: 'test-secret'
    });
    
    await cache.set('secure-key', { sensitive: 'data' });
    
    const result1 = await cache.get('secure-key');
    expect(result1).toEqual({ sensitive: 'data' });
    
    // Wait for expiration
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const result2 = await cache.get('secure-key');
    expect(result2).toBeNull();
  });
});