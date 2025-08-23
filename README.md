# Cryonix 🚀

**Enterprise-grade caching library with offline-first synchronization, multiple storage engines, and advanced security features.**

[![npm version](https://badge.fury.io/js/cryonix.svg)](https://www.npmjs.com/package/cryonix)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🌟 Why Cryonix?

Cryonix transforms how modern applications handle data caching and synchronization. Built for **progressive web apps**, **offline-first experiences**, and **enterprise applications** that demand reliability and performance.

### ✨ Key Features

- 🔄 **Offline-First Sync** - Automatic API synchronization with conflict resolution
- 🏪 **Multiple Storage Engines** - Memory, LocalStorage, SessionStorage, IndexedDB, Cookies
- 🔐 **Enterprise Security** - AES encryption with customizable secrets
- ⏰ **TTL Support** - Automatic expiration with Time-To-Live functionality
- 🏷️ **Namespace Isolation** - Prevent key collisions across applications
- 📦 **Full TypeScript Support** - Complete type safety and IntelliSense
- ⚡ **Async/Await API** - Modern, promise-based interface
- 🔧 **Pluggable Architecture** - Extensible and customizable
- 🎯 **Batch Operations** - Efficient bulk synchronization
- 🔄 **Conflict Resolution** - Smart handling of concurrent modifications
- 📊 **Queue Management** - Persistent operation queuing with retry logic

## 📦 Installation

```bash
npm install cryonix
# or
yarn add cryonix
```

## 🚀 Quick Start

### Basic Caching

```typescript
import { createCache } from 'cryonix';

// Create cache with localStorage backend and TTL
const cache = createCache({ 
  backend: 'local', 
  namespace: 'myapp',
  ttl: 3600 // Default 1 hour expiration
});

// Store any data type
await cache.set('user', { id: 1, name: 'John', preferences: {...} });
await cache.set('settings', { theme: 'dark', language: 'en' });

// Store with custom TTL
await cache.set('session', sessionData, { ttl: 1800 }); // 30 minutes

// Retrieve with type safety
const user = await cache.get<User>('user');
const settings = await cache.get<Settings>('settings');

// Clean up
await cache.remove('user');
await cache.clear(); // Clear all data
```

### Offline-First with Auto-Sync

```typescript
import { createCache } from 'cryonix';

// Create cache with automatic API synchronization
const cache = createCache({
  backend: 'indexeddb',
  namespace: 'ecommerce',
  sync: {
    apiEndpoint: 'https://api.myapp.com/sync',
    batchSize: 10,
    maxRetries: 3,
    conflictResolution: 'last-write-wins',
    
    // Custom sync handler
    onSync: async (operations) => {
      const response = await fetch('/api/batch-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operations })
      });
      const result = await response.json();
      return result.success; // Array of boolean results
    },
    
    // Lifecycle hooks
    hooks: {
      onSyncComplete: (successful, failed) => {
        console.log(`✅ Synced ${successful} items, ❌ ${failed} failed`);
      },
      onConflict: async (local, remote) => {
        // Custom merge logic
        return { ...local.data, ...remote, lastModified: Date.now() };
      }
    }
  }
});

// Works seamlessly online and offline
await cache.set('cart', cartItems);     // Auto-queued for sync
await cache.set('wishlist', wishItems); // Auto-queued for sync

// Manual sync control
await cache.sync();                     // Force sync now
console.log(cache.getQueueSize());      // Check pending operations
cache.excludeFromSync('temp_*');        // Exclude temporary data
```

## 🏪 Storage Engines

### Available Engines

```typescript
import { 
  CacheManager, 
  MemoryEngine,      // Fast, temporary storage
  LocalStorageEngine, // Persistent browser storage
  SessionStorageEngine, // Session-only storage
  IndexedDBEngine,   // Large data, advanced queries
  CookieEngine       // Cross-domain, server-accessible
} from 'cryonix';

// High-performance memory cache
const memoryCache = new CacheManager(new MemoryEngine());

// Persistent browser storage
const persistentCache = new CacheManager(new LocalStorageEngine());

// Large dataset storage with IndexedDB
const bigDataCache = new CacheManager(
  new IndexedDBEngine('MyApp', 'cache', 1)
);
```

### Storage Comparison

| Engine | Capacity | Persistence | Performance | Use Case |
|--------|----------|-------------|-------------|----------|
| Memory | ~1GB | Session only | ⚡ Fastest | Temporary data, high-frequency access |
| LocalStorage | ~5-10MB | Permanent | 🚀 Fast | User preferences, app state |
| SessionStorage | ~5-10MB | Session only | 🚀 Fast | Temporary session data |
| IndexedDB | ~1GB+ | Permanent | ⚡ Fast | Large datasets, offline apps |
| Cookies | ~4KB | Configurable | 🐌 Slower | Cross-domain, server access |

## 🔐 Enterprise Security

```typescript
// AES encryption for sensitive data
const secureCache = new CacheManager(new LocalStorageEngine(), {
  secure: true,
  secret: process.env.CACHE_SECRET_KEY,
  namespace: 'secure-data'
});

// All data automatically encrypted
await secureCache.set('apiKeys', { stripe: 'sk_...', aws: 'AKIA...' });
await secureCache.set('userTokens', { jwt: 'eyJ...', refresh: 'rt_...' });

// Data is encrypted in storage, decrypted on retrieval
const tokens = await secureCache.get('userTokens');
```

## ⏰ TTL (Time-To-Live) Support

Automatic data expiration with flexible TTL configuration for efficient cache management.

### Basic TTL Usage

```typescript
// Set default TTL for all cache operations
const cache = createCache({
  backend: 'local',
  ttl: 3600 // 1 hour default expiration (in seconds)
});

// Data expires automatically after 1 hour
await cache.set('user-session', sessionData);

// Override TTL per operation
await cache.set('temp-data', tempData, { ttl: 300 }); // 5 minutes
await cache.set('permanent', data, { ttl: 0 });       // Never expires
```

### Advanced TTL Features

```typescript
// Different TTL strategies
const cache = createCache({ backend: 'indexeddb', ttl: 1800 });

// Short-lived cache for API responses
await cache.set('api-response', data, { ttl: 60 }); // 1 minute

// Medium-lived cache for user preferences
await cache.set('user-prefs', prefs, { ttl: 86400 }); // 24 hours

// Long-lived cache for static content
await cache.set('app-config', config, { ttl: 604800 }); // 1 week

// Automatic cleanup of expired items
const cleanedCount = await cache.cleanupExpired();
console.log(`Cleaned up ${cleanedCount} expired items`);
```

### TTL with Encryption

```typescript
// Combine TTL with encryption for secure, temporary data
const secureCache = createCache({
  backend: 'local',
  ttl: 900,        // 15 minutes default
  secure: true,
  secret: 'your-secret-key'
});

// Encrypted data that expires automatically
await secureCache.set('auth-token', token, { ttl: 3600 }); // 1 hour
await secureCache.set('sensitive-temp', data, { ttl: 300 }); // 5 minutes
```

### Real-World TTL Examples

```typescript
// E-commerce cart with session-based expiration
const cartCache = createCache({
  backend: 'local',
  namespace: 'shopping-cart',
  ttl: 7200 // 2 hours
});

// API response caching with different TTLs
const apiCache = createCache({ backend: 'memory' });

// Fast-changing data
await apiCache.set('stock-prices', prices, { ttl: 30 });     // 30 seconds

// Moderate-changing data  
await apiCache.set('product-list', products, { ttl: 300 });  // 5 minutes

// Slow-changing data
await apiCache.set('categories', categories, { ttl: 3600 }); // 1 hour

// User session management
const sessionCache = createCache({
  backend: 'session',
  namespace: 'user-session',
  ttl: 1800 // 30 minutes
});

await sessionCache.set('user-data', userData);
await sessionCache.set('permissions', permissions);

// Automatic cleanup on app startup
setInterval(async () => {
  const cleaned = await apiCache.cleanupExpired();
  if (cleaned > 0) {
    console.log(`Cleaned ${cleaned} expired cache entries`);
  }
}, 60000); // Check every minute
```

## 🔄 Advanced Sync Features

### Conflict Resolution Strategies

```typescript
const cache = createCache({
  backend: 'indexeddb',
  sync: {
    apiEndpoint: '/api/sync',
    conflictResolution: 'merge', // 'last-write-wins' | 'merge' | 'manual'
    
    hooks: {
      // Custom conflict resolution
      onConflict: async (localOp, remoteData) => {
        if (localOp.key === 'user-profile') {
          // Merge user profiles intelligently
          return {
            ...remoteData,
            ...localOp.data,
            lastModified: Math.max(
              localOp.data.lastModified, 
              remoteData.lastModified
            )
          };
        }
        return localOp.data; // Default to local
      }
    }
  }
});
```

### Selective Synchronization

```typescript
// Exclude sensitive or temporary data from sync
cache.excludeFromSync('session_*');
cache.excludeFromSync('temp_cache');

// Per-operation sync control
await cache.set('user-data', userData);              // Will sync
await cache.set('temp-state', tempData, {sync: false}); // Won't sync

// Batch exclusions
const cache = createCache({
  sync: {
    excludeKeys: ['temp_*', 'cache_*', 'session_*'],
    // ...
  }
});
```

### Queue Management

```typescript
// Monitor sync queue
console.log('Pending operations:', cache.getQueueSize());
console.log('Queue contents:', cache.getSyncQueue());

// Queue management
await cache.clearSyncQueue();           // Clear all pending
await cache.removeFromSyncQueue('op-id'); // Remove specific operation

// Network status
console.log('Online:', cache.isOnline());
```

## 📊 Real-World Examples

### E-Commerce Application

```typescript
const ecommerceCache = createCache({
  backend: 'indexeddb',
  namespace: 'shop',
  sync: {
    apiEndpoint: 'https://api.shop.com/sync',
    batchSize: 20,
    excludeKeys: ['cart_temp', 'search_*'],
    hooks: {
      onSyncComplete: (success, failed) => {
        updateUI(`Synced ${success} items`);
      }
    }
  }
});

// Shopping cart (syncs across devices)
await ecommerceCache.set('cart', cartItems);

// User preferences (encrypted)
const userCache = new CacheManager(new LocalStorageEngine(), {
  secure: true,
  secret: userSecretKey
});
await userCache.set('payment-methods', paymentMethods);
```

### Progressive Web App

```typescript
const pwaCache = createCache({
  backend: 'indexeddb',
  namespace: 'pwa-v1',
  sync: {
    apiEndpoint: '/api/offline-sync',
    maxQueueSize: 1000,
    retryDelay: 2000,
    hooks: {
      onSyncStart: () => showSyncIndicator(),
      onSyncComplete: () => hideSyncIndicator(),
      onSyncError: (op, error) => logError(op, error)
    }
  }
});

// Works perfectly offline
await pwaCache.set('user-posts', posts);
await pwaCache.set('app-settings', settings);

// Auto-syncs when connection returns
```

## 📚 Complete API Reference

### CacheManager Methods

```typescript
// Core operations
await cache.set<T>(key: string, value: T, options?: {sync?: boolean, ttl?: number}): Promise<void>
await cache.get<T>(key: string): Promise<T | null>
await cache.remove(key: string, options?: {sync?: boolean}): Promise<void>
await cache.clear(): Promise<void>

// TTL operations
await cache.cleanupExpired(): Promise<number> // Returns count of cleaned items

// Sync operations
cache.enableSync(config: SyncConfig): void
await cache.sync(): Promise<void>
cache.getSyncQueue(): SyncOperation[]
await cache.clearSyncQueue(): Promise<void>
cache.isOnline(): boolean

// Queue management
cache.getQueueSize(): number
cache.excludeFromSync(key: string): void
cache.includeInSync(key: string): void
await cache.removeFromSyncQueue(operationId: string): Promise<void>
```

### Configuration Options

```typescript
interface CreateCacheOptions {
  backend?: 'memory' | 'local' | 'session' | 'indexeddb' | 'cookie'
  namespace?: string
  ttl?: number              // Default TTL in seconds
  secure?: boolean          // Enable encryption
  secret?: string           // Encryption secret
  sync?: SyncConfig
}

interface SyncConfig {
  apiEndpoint: string
  maxRetries?: number        // Default: 3
  retryDelay?: number        // Default: 1000ms
  maxQueueSize?: number      // Default: 1000
  batchSize?: number         // Default: 10
  conflictResolution?: 'last-write-wins' | 'merge' | 'manual'
  excludeKeys?: string[]
  hooks?: SyncHooks
  onSync?: (operations: SyncOperation[]) => Promise<boolean[]>
}
```

## 🏆 Why Choose Cryonix?

### For Developers
- **Zero Configuration** - Works out of the box
- **TypeScript First** - Complete type safety
- **Modern API** - Promise-based, async/await
- **Extensive Documentation** - Clear examples and guides

### For Enterprises
- **Production Ready** - Battle-tested in real applications
- **Scalable Architecture** - Handles large datasets efficiently
- **Security Focused** - AES encryption, secure by default
- **Offline Resilience** - Never lose data, automatic sync

### For Teams
- **Consistent API** - Same interface across all storage types
- **Pluggable Design** - Easy to extend and customize
- **Comprehensive Testing** - Full test coverage
- **Active Maintenance** - Regular updates and improvements

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

MIT © [Your Name](https://github.com/yourusername)

---

**Built with ❤️ for the modern web. Star ⭐ if you find Cryonix useful!**