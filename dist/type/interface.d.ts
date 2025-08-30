export interface IStorageEngine {
    set(key: string, value: string): Promise<void>;
    get(key: string): Promise<string | null>;
    remove(key: string): Promise<void>;
    clear(): Promise<void>;
    keys(): Promise<string[]>;
}
export type BackendType = "memory" | "local" | "session";
export interface CreateCacheOptions {
    backend?: BackendType;
    namespace?: string;
    ttl?: number;
    secure?: boolean;
    secret?: string;
    sync?: SyncConfig;
}
export interface CacheOptions {
    ttl?: number;
}
export interface CacheRecord<T> {
    value: T;
    expiresAt: number | null;
}
export interface Namespace {
    add(key: string): string;
    strip(key: string): string;
    prefix: string;
}
export interface CacheManagerOptions {
    namespace?: string;
    secure?: boolean;
    secret?: string;
    ttl?: number;
    syncEnabled?: boolean;
}
export interface SyncOperation {
    id: string;
    type: 'CREATE' | 'UPDATE' | 'DELETE';
    key: string;
    data?: any;
    timestamp: number;
    retryCount: number;
    version?: number;
}
export type ConflictResolution = 'last-write-wins' | 'merge' | 'manual';
export interface SyncHooks {
    onSyncStart?: () => void;
    onSyncSuccess?: (operation: SyncOperation) => void;
    onSyncError?: (operation: SyncOperation, error: Error) => void;
    onSyncComplete?: (successful: number, failed: number) => void;
    onConflict?: (local: SyncOperation, remote: any) => Promise<any>;
}
export interface SyncConfig {
    apiEndpoint: string;
    syncKey?: string;
    maxRetries?: number;
    retryDelay?: number;
    maxQueueSize?: number;
    batchSize?: number;
    conflictResolution?: ConflictResolution;
    excludeKeys?: string[];
    hooks?: SyncHooks;
    onSync?: (operations: SyncOperation[]) => Promise<boolean[]>;
}
//# sourceMappingURL=interface.d.ts.map