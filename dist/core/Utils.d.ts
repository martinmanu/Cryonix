export declare class Utils {
    static encode<T>(value: T): string;
    static decode<T>(data: string): T;
    static encrypt<T>(value: T, secret: string): Promise<string>;
    static decrypt<T>(ciphertext: string, secret: string): Promise<T>;
}
//# sourceMappingURL=Utils.d.ts.map