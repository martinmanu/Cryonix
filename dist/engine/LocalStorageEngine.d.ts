import { IStorageEngine } from "../type/interface";
export declare class LocalStorageEngine implements IStorageEngine {
    set(key: string, value: string): Promise<void>;
    get(key: string): Promise<string | null>;
    remove(key: string): Promise<void>;
    clear(): Promise<void>;
    keys(): Promise<string[]>;
}
//# sourceMappingURL=LocalStorageEngine.d.ts.map