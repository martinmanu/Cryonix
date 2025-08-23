import { IStorageEngine } from "../type/interface";
export declare class MemoryEngine implements IStorageEngine {
    private store;
    set(key: string, value: string): Promise<void>;
    get(key: string): Promise<string | null>;
    remove(key: string): Promise<void>;
    clear(): Promise<void>;
    keys(): Promise<string[]>;
}
//# sourceMappingURL=MemoryEngine.d.ts.map