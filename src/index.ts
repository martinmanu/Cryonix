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

return new CacheManager(engine, { namespace });
}