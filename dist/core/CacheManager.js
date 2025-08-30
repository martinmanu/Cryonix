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
        this.defaultTTL = options?.ttl;
    }
    enableSync(config) {
        this.syncManager = new SyncManager_1.SyncManager(this.engine, config);
    }
    withNamespace(key) {
        return this.namespace ? this.namespace.add(key) : key;
    }
    async set(key, value, options) {
        const finalKey = this.withNamespace(key);
        // Create cache record with TTL
        const ttl = options?.ttl ?? this.defaultTTL;
        const cacheRecord = {
            value,
            expiresAt: ttl ? Date.now() + (ttl * 1000) : null
        };
        const processedValue = this.secure && this.secret
            ? await Utils_1.Utils.encrypt(cacheRecord, this.secret)
            : Utils_1.Utils.encode(cacheRecord);
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
        try {
            const cacheRecord = this.secure && this.secret
                ? await Utils_1.Utils.decrypt(data, this.secret)
                : Utils_1.Utils.decode(data);
            // Handle legacy data (direct values without CacheRecord wrapper)
            if (cacheRecord && typeof cacheRecord === 'object' && 'value' in cacheRecord) {
                // Check if expired
                if (cacheRecord.expiresAt && Date.now() > cacheRecord.expiresAt) {
                    await this.remove(key);
                    return null;
                }
                return cacheRecord.value;
            }
            else {
                // Legacy data without TTL wrapper
                return cacheRecord;
            }
        }
        catch (error) {
            // If parsing fails, remove corrupted data
            await this.remove(key);
            return null;
        }
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
    // TTL methods
    async cleanupExpired() {
        const allKeys = await this.engine.keys();
        let cleanedCount = 0;
        for (const key of allKeys) {
            if (this.namespace && !key.startsWith(this.namespace.prefix + ':')) {
                continue; // Skip keys not in our namespace
            }
            const data = await this.engine.get(key);
            if (!data)
                continue;
            try {
                const cacheRecord = this.secure && this.secret
                    ? await Utils_1.Utils.decrypt(data, this.secret)
                    : Utils_1.Utils.decode(data);
                if (cacheRecord && typeof cacheRecord === 'object' && 'expiresAt' in cacheRecord) {
                    if (cacheRecord.expiresAt && Date.now() > cacheRecord.expiresAt) {
                        await this.engine.remove(key);
                        cleanedCount++;
                    }
                }
            }
            catch (error) {
                // Remove corrupted data
                await this.engine.remove(key);
                cleanedCount++;
            }
        }
        return cleanedCount;
    }
}
exports.CacheManager = CacheManager;
//# sourceMappingURL=CacheManager.js.map