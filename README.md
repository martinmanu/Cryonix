# Cryonix

A flexible caching library with multiple storage engines and encryption support.

## Features

- 🚀 Multiple storage engines (Memory, LocalStorage, SessionStorage, IndexedDB, Cookies)
- 🔐 Optional encryption for sensitive data
- 🏷️ Namespace support to avoid key collisions
- 📦 TypeScript support with full type safety
- ⚡ Async/await API
- 🔧 Pluggable architecture

## Installation

```bash
npm install cryonix
```

## Quick Start

```typescript
import { createCache } from 'cryonix';

// Create a cache with localStorage
const cache = createCache({ backend: 'local', namespace: 'myapp' });

// Store data
await cache.set('user', { id: 1, name: 'John' });

// Retrieve data
const user = await cache.get('user');
console.log(user); // { id: 1, name: 'John' }

// Remove data
await cache.remove('user');

// Clear all data
await cache.clear();
```

## Storage Engines

```typescript
import { CacheManager, MemoryEngine, LocalStorageEngine, IndexedDBEngine } from 'cryonix';

// Memory storage
const memoryCache = new CacheManager(new MemoryEngine());

// Browser localStorage
const localCache = new CacheManager(new LocalStorageEngine());

// IndexedDB for large data
const idbCache = new CacheManager(new IndexedDBEngine());
```

## Encryption

```typescript
const secureCache = new CacheManager(new LocalStorageEngine(), {
  secure: true,
  secret: 'your-secret-key',
  namespace: 'secure-data'
});

await secureCache.set('sensitive', { token: 'abc123' });
```

## API

### CacheManager

- `set<T>(key: string, value: T): Promise<void>`
- `get<T>(key: string): Promise<T | null>`
- `remove(key: string): Promise<void>`
- `clear(): Promise<void>`

## License

MIT