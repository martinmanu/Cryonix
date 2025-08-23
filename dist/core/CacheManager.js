"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheManager = void 0;
const Namespace_1 = require("./Namespace");
const Utils_1 = require("./Utils");
const SyncManager_1 = require("./SyncManager");
class CacheManager {
    constructor(engine, options) {
        this.engine = engine;
        this.secure = options?.secure ?? false;
        this.secret = options?.secret;
        this.namespace = options?.namespace ? (0, Namespace_1.createNamespace)(options.namespace) : undefined;
    }
    enableSync(config) {
        this.syncManager = new SyncManager_1.SyncManager(this.engine, config);
    }
    withNamespace(key) {
        return this.namespace ? this.namespace.add(key) : key;
    }
    async set(key, value, options) {
        const finalKey = this.withNamespace(key);
        const processedValue = this.secure && this.secret
            ? await Utils_1.Utils.encrypt(value, this.secret)
            : Utils_1.Utils.encode(value);
        await this.engine.set(finalKey, processedValue);
        if (this.syncManager && options?.sync !== false) {
            await this.syncManager.queueOperation('UPDATE', key, value);
        }
    }
    async get(key) {
        const finalKey = this.withNamespace(key);
        const data = await this.engine.get(finalKey);
        if (!data)
            return null;
        return this.secure && this.secret
            ? await Utils_1.Utils.decrypt(data, this.secret)
            : Utils_1.Utils.decode(data);
    }
    async remove(key, options) {
        const finalKey = this.withNamespace(key);
        await this.engine.remove(finalKey);
        if (this.syncManager && options?.sync !== false) {
            await this.syncManager.queueOperation('DELETE', key);
        }
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
    // Sync methods
    async sync() {
        await this.syncManager?.processSyncQueue();
    }
    getSyncQueue() {
        return this.syncManager?.getSyncQueue() || [];
    }
    async clearSyncQueue() {
        await this.syncManager?.clearSyncQueue();
    }
    isOnline() {
        return this.syncManager?.isOnlineStatus() ?? navigator.onLine;
    }
    getQueueSize() {
        return this.syncManager?.getQueueSize() || 0;
    }
    excludeFromSync(key) {
        this.syncManager?.addExcludeKey(key);
    }
    includeInSync(key) {
        this.syncManager?.removeExcludeKey(key);
    }
    async removeFromSyncQueue(operationId) {
        await this.syncManager?.removeFromQueue(operationId);
    }
}
exports.CacheManager = CacheManager;
//# sourceMappingURL=CacheManager.js.map