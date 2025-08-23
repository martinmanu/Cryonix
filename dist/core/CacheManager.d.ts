import { IStorageEngine, CacheManagerOptions } from "../type/interface";
export declare class CacheManager {
    private engine;
    private namespace?;
    private secure;
    private secret?;
    constructor(engine: IStorageEngine, options?: CacheManagerOptions);
    private withNamespace;
    set<T>(key: string, value: T): Promise<void>;
    get<T>(key: string): Promise<T | null>;
    remove(key: string): Promise<void>;
    clear(): Promise<void>;
}
//# sourceMappingURL=CacheManager.d.ts.map