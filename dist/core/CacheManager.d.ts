import { IStorageEngine, CacheManagerOptions, SyncConfig } from "../type/interface";
export declare class CacheManager {
    private engine;
    private namespace?;
    private secure;
    private secret?;
    private syncManager?;
    constructor(engine: IStorageEngine, options?: CacheManagerOptions);
    enableSync(config: SyncConfig): void;
    private withNamespace;
    set<T>(key: string, value: T, options?: {
        sync?: boolean;
    }): Promise<void>;
    get<T>(key: string): Promise<T | null>;
    remove(key: string, options?: {
        sync?: boolean;
    }): Promise<void>;
    clear(): Promise<void>;
    sync(): Promise<void>;
    getSyncQueue(): import("../type/interface").SyncOperation[];
    clearSyncQueue(): Promise<void>;
    isOnline(): boolean;
    getQueueSize(): number;
    excludeFromSync(key: string): void;
    includeInSync(key: string): void;
    removeFromSyncQueue(operationId: string): Promise<void>;
}
//# sourceMappingURL=CacheManager.d.ts.map