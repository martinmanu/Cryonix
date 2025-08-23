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
}
//# sourceMappingURL=interface.d.ts.map