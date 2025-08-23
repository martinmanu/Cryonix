"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheManager = void 0;
const Namespace_1 = require("./Namespace");
const Utils_1 = require("./Utils");
class CacheManager {
    constructor(engine, options) {
        this.engine = engine;
        this.secure = options?.secure ?? false;
        this.secret = options?.secret;
        this.namespace = options?.namespace ? (0, Namespace_1.createNamespace)(options.namespace) : undefined;
    }
    withNamespace(key) {
        return this.namespace ? this.namespace.add(key) : key;
    }
    async set(key, value) {
        const finalKey = this.withNamespace(key);
        if (this.secure && this.secret) {
            const encrypted = await Utils_1.Utils.encrypt(value, this.secret);
            await this.engine.set(finalKey, encrypted);
        }
        else {
            const encoded = Utils_1.Utils.encode(value);
            await this.engine.set(finalKey, encoded);
        }
    }
    async get(key) {
        const finalKey = this.withNamespace(key);
        const data = await this.engine.get(finalKey);
        if (!data)
            return null;
        if (this.secure && this.secret) {
            return await Utils_1.Utils.decrypt(data, this.secret);
        }
        else {
            return Utils_1.Utils.decode(data);
        }
    }
    async remove(key) {
        const finalKey = this.withNamespace(key);
        await this.engine.remove(finalKey);
    }
    async clear() {
        if (this.namespace) {
            // Clear only items within this namespace
            const keys = await this.engine.keys();
            const nsKeys = keys.filter((k) => k.startsWith(this.namespace.prefix + ":"));
            for (const k of nsKeys) {
                await this.engine.remove(k);
            }
        }
        else {
            // Clear everything
            await this.engine.clear();
        }
    }
}
exports.CacheManager = CacheManager;
//# sourceMappingURL=CacheManager.js.map