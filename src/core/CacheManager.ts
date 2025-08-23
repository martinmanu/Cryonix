
import { IStorageEngine, CacheManagerOptions, Namespace, SyncConfig } from "../type/interface";
import { createNamespace } from "./Namespace";
import { Utils } from "./Utils";
import { SyncManager } from "./SyncManager";


export class CacheManager {
  private engine: IStorageEngine;
  private namespace?: Namespace;
  private secure: boolean;
  private secret?: string;
  private syncManager?: SyncManager;
  private defaultTTL?: number;

  constructor(engine: IStorageEngine, options?: CacheManagerOptions) {
    this.engine = engine;
    this.secure = options?.secure ?? false;
    this.secret = options?.secret;
    this.namespace = options?.namespace ? createNamespace(options.namespace) : undefined;
    this.defaultTTL = options?.ttl;
  }

  enableSync(config: SyncConfig): void {
    this.syncManager = new SyncManager(this.engine, config);
  }

  private withNamespace(key: string): string {
    return this.namespace ? this.namespace.add(key) : key;
  }

  async set<T>(key: string, value: T, options?: { sync?: boolean; ttl?: number }): Promise<void> {
    const finalKey = this.withNamespace(key);
    
    // Create cache record with TTL
    const ttl = options?.ttl ?? this.defaultTTL;
    const cacheRecord = {
      value,
      expiresAt: ttl ? Date.now() + (ttl * 1000) : null
    };
    
    const processedValue = this.secure && this.secret 
      ? await Utils.encrypt(cacheRecord, this.secret)
      : Utils.encode(cacheRecord);
    
    await this.engine.set(finalKey, processedValue);

    if (this.syncManager && options?.sync !== false) {
      await this.syncManager.queueOperation('UPDATE', key, value);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const finalKey = this.withNamespace(key);
    const data = await this.engine.get(finalKey);
    if (!data) return null;

    try {
      const cacheRecord = this.secure && this.secret 
        ? await Utils.decrypt<any>(data, this.secret)
        : Utils.decode<any>(data);

      // Handle legacy data (direct values without CacheRecord wrapper)
      if (cacheRecord && typeof cacheRecord === 'object' && 'value' in cacheRecord) {
        // Check if expired
        if (cacheRecord.expiresAt && Date.now() > cacheRecord.expiresAt) {
          await this.remove(key);
          return null;
        }
        return cacheRecord.value;
      } else {
        // Legacy data without TTL wrapper
        return cacheRecord;
      }
    } catch (error) {
      // If parsing fails, remove corrupted data
      await this.remove(key);
      return null;
    }
  }

  async remove(key: string, options?: { sync?: boolean }): Promise<void> {
    const finalKey = this.withNamespace(key);
    await this.engine.remove(finalKey);

    if (this.syncManager && options?.sync !== false) {
      await this.syncManager.queueOperation('DELETE', key);
    }
  }

  async clear(): Promise<void> {
    if (this.namespace) {
      // Clear only items within this namespace
      const keys = await this.engine.keys();
      const nsKeys = keys.filter((k) => k.startsWith(this.namespace!.prefix + ":"));
      for (const k of nsKeys) {
        await this.engine.remove(k);
      }
    } else {
      // Clear everything
      await this.engine.clear();
    }
  }

  // Sync methods
  async sync(): Promise<void> {
    await this.syncManager?.processSyncQueue();
  }

  getSyncQueue() {
    return this.syncManager?.getSyncQueue() || [];
  }

  async clearSyncQueue(): Promise<void> {
    await this.syncManager?.clearSyncQueue();
  }

  isOnline(): boolean {
    return this.syncManager?.isOnlineStatus() ?? navigator.onLine;
  }

  getQueueSize(): number {
    return this.syncManager?.getQueueSize() || 0;
  }

  excludeFromSync(key: string): void {
    this.syncManager?.addExcludeKey(key);
  }

  includeInSync(key: string): void {
    this.syncManager?.removeExcludeKey(key);
  }

  async removeFromSyncQueue(operationId: string): Promise<void> {
    await this.syncManager?.removeFromQueue(operationId);
  }

  // TTL methods
  async cleanupExpired(): Promise<number> {
    const allKeys = await this.engine.keys();
    let cleanedCount = 0;
    
    for (const key of allKeys) {
      if (this.namespace && !key.startsWith(this.namespace.prefix + ':')) {
        continue; // Skip keys not in our namespace
      }
      
      const data = await this.engine.get(key);
      if (!data) continue;
      
      try {
        const cacheRecord = this.secure && this.secret 
          ? await Utils.decrypt<any>(data, this.secret)
          : Utils.decode<any>(data);
        
        if (cacheRecord && typeof cacheRecord === 'object' && 'expiresAt' in cacheRecord) {
          if (cacheRecord.expiresAt && Date.now() > cacheRecord.expiresAt) {
            await this.engine.remove(key);
            cleanedCount++;
          }
        }
      } catch (error) {
        // Remove corrupted data
        await this.engine.remove(key);
        cleanedCount++;
      }
    }
    
    return cleanedCount;
  }
}
