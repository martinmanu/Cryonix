import { MemoryEngine } from '../src/engine/MemoryEngine';
import { LocalStorageEngine } from '../src/engine/LocalStorageEngine';
import { SessionStorageEngine } from '../src/engine/SessionStorageEngine';
import { CookieEngine } from '../src/engine/CookieEngine';

describe('Storage Engines', () => {
  
  describe('MemoryEngine', () => {
    let engine: MemoryEngine;

    beforeEach(() => {
      engine = new MemoryEngine();
    });

    it('should set and get values', async () => {
      await engine.set('key1', 'value1');
      const result = await engine.get('key1');
      expect(result).toBe('value1');
    });

    it('should return null for non-existent keys', async () => {
      const result = await engine.get('nonexistent');
      expect(result).toBeNull();
    });

    it('should remove values', async () => {
      await engine.set('key1', 'value1');
      await engine.remove('key1');
      const result = await engine.get('key1');
      expect(result).toBeNull();
    });

    it('should clear all values', async () => {
      await engine.set('key1', 'value1');
      await engine.set('key2', 'value2');
      await engine.clear();
      expect(await engine.get('key1')).toBeNull();
      expect(await engine.get('key2')).toBeNull();
    });

    it('should return all keys', async () => {
      await engine.set('key1', 'value1');
      await engine.set('key2', 'value2');
      const keys = await engine.keys();
      expect(keys).toEqual(['key1', 'key2']);
    });
  });

  describe('LocalStorageEngine', () => {
    let engine: LocalStorageEngine;

    beforeEach(() => {
      engine = new LocalStorageEngine();
      localStorage.clear();
    });

    it('should set and get values', async () => {
      await engine.set('key1', 'value1');
      const result = await engine.get('key1');
      expect(result).toBe('value1');
    });

    it('should remove values', async () => {
      await engine.set('key1', 'value1');
      await engine.remove('key1');
      const result = await engine.get('key1');
      expect(result).toBeNull();
    });

    it('should clear all values', async () => {
      await engine.set('key1', 'value1');
      await engine.clear();
      const result = await engine.get('key1');
      expect(result).toBeNull();
    });
  });

  describe('SessionStorageEngine', () => {
    let engine: SessionStorageEngine;

    beforeEach(() => {
      engine = new SessionStorageEngine();
      sessionStorage.clear();
    });

    it('should set and get values', async () => {
      await engine.set('key1', 'value1');
      const result = await engine.get('key1');
      expect(result).toBe('value1');
    });

    it('should remove values', async () => {
      await engine.set('key1', 'value1');
      await engine.remove('key1');
      const result = await engine.get('key1');
      expect(result).toBeNull();
    });
  });

  describe('CookieEngine', () => {
    let engine: CookieEngine;

    beforeEach(() => {
      engine = new CookieEngine();
      // Clear cookies
      document.cookie.split(";").forEach(cookie => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      });
    });

    it('should set and get values', async () => {
      await engine.set('key1', 'value1');
      const result = await engine.get('key1');
      expect(result).toBe('value1');
    });

    it('should handle URL encoding', async () => {
      await engine.set('key1', 'value with spaces');
      const result = await engine.get('key1');
      expect(result).toBe('value with spaces');
    });
  });
});