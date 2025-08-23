export { CacheManager } from "./core/CacheManager";
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
export declare function createCache(options?: CreateCacheOptions): CacheManager;
//# sourceMappingURL=index.d.ts.map