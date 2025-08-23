import { IStorageEngine } from "../type/interface";
export declare class IndexedDBEngine implements IStorageEngine {
    private dbName;
    private storeName;
    private version;
    private dbPromise;
    constructor(dbName?: string, storeName?: string, version?: number);
    private openDB;
    set(key: string, value: string): Promise<void>;
    get(key: string): Promise<string | null>;
    remove(key: string): Promise<void>;
    clear(): Promise<void>;
    keys(): Promise<string[]>;
}
//# sourceMappingURL=IndexedDBEngine.d.ts.map