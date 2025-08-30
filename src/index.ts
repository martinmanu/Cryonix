export { CacheManager } from "./core/CacheManager";
export { SyncManager } from "./core/SyncManager";
export { createNamespace } from "./core/Namespace";
export { Utils } from "./core/Utils";

export { MemoryEngine } from "./engine/MemoryEngine";
export { LocalStorageEngine } from "./engine/LocalStorageEngine";
export { SessionStorageEngine } from "./engine/SessionStorageEngine";
export { CookieEngine } from "./engine/CookieEngine";
export { IndexedDBEngine } from "./engine/IndexedDBEngine";

export * from "./type/interface";
import { CreateCacheOptions } from "./type/interface";
import { CacheManager } from "./core/CacheManager";
import { LocalStorageEngine } from "./engine/LocalStorageEngine";
import { SessionStorageEngine } from "./engine/SessionStorageEngine";
import { MemoryEngine } from "./engine/MemoryEngine";

export function createCache(options: CreateCacheOptions = {}): CacheManager {
  const backend = options.backend ?? "memory";
  const namespace = options.namespace ?? "default";

  let engine;
  switch (backend) {
    case "local":
      engine = new LocalStorageEngine();
      break;
    case "session":
      engine = new SessionStorageEngine();
      break;
    case "memory":
    default:
      engine = new MemoryEngine();
      break;
  }

  const cache = new CacheManager(engine, { 
    namespace,
    ttl: options.ttl,
    secure: options.secure,
    secret: options.secret
  });
  
  if (options.sync) {
    cache.enableSync(options.sync);
  }
  
  return cache;
}