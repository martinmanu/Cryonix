
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

  constructor(engine: IStorageEngine, options?: CacheManagerOptions) {
    this.engine = engine;
    this.secure = options?.secure ?? false;
    this.secret = options?.secret;
    this.namespace = options?.namespace ? createNamespace(options.namespace) : undefined;
  }

  enableSync(config: SyncConfig): void {
    this.syncManager = new SyncManager(this.engine, config);
  }

  private withNamespace(key: string): string {
    return this.namespace ? this.namespace.add(key) : key;
  }

  async set<T>(key: string, value: T, options?: { sync?: boolean }): Promise<void> {
    const finalKey = this.withNamespace(key);
    const processedValue = this.secure && this.secret 
      ? await Utils.encrypt(value, this.secret)
      : Utils.encode(value);
    
    await this.engine.set(finalKey, processedValue);

    if (this.syncManager && options?.sync !== false) {
      await this.syncManager.queueOperation('UPDATE', key, value);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const finalKey = this.withNamespace(key);
    const data = await this.engine.get(finalKey);
    if (!data) return null;

    return this.secure && this.secret 
      ? await Utils.decrypt<T>(data, this.secret)
      : Utils.decode<T>(data);
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
}
