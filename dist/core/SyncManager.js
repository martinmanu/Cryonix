"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncManager = void 0;
class SyncManager {
    constructor(engine, config) {
        this.syncQueue = [];
        this.isOnline = navigator.onLine;
        this.syncInProgress = false;
        this.versionCounter = 0;
        this.engine = engine;
        this.config = {
            maxRetries: 3,
            retryDelay: 1000,
            syncKey: '_sync_queue',
            maxQueueSize: 1000,
            batchSize: 10,
            conflictResolution: 'last-write-wins',
            excludeKeys: [],
            ...config
        };
        this.setupNetworkListeners();
        this.loadSyncQueue();
    }
    setupNetworkListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.processSyncQueue();
        });
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }
    async loadSyncQueue() {
        try {
            const queueData = await this.engine.get(this.config.syncKey);
            if (queueData) {
                this.syncQueue = JSON.parse(queueData);
            }
        }
        catch (error) {
            console.warn('Failed to load sync queue:', error);
        }
    }
    async saveSyncQueue() {
        try {
            await this.engine.set(this.config.syncKey, JSON.stringify(this.syncQueue));
        }
        catch (error) {
            console.warn('Failed to save sync queue:', error);
        }
    }
    async queueOperation(type, key, data) {
        // Check if key should be excluded from sync
        if (this.config.excludeKeys?.includes(key)) {
            return;
        }
        // Handle conflict resolution for existing operations
        const existingIndex = this.syncQueue.findIndex(op => op.key === key);
        if (existingIndex !== -1) {
            const existing = this.syncQueue[existingIndex];
            if (this.config.conflictResolution === 'last-write-wins') {
                this.syncQueue.splice(existingIndex, 1); // Remove old operation
            }
            else if (this.config.conflictResolution === 'merge' && this.config.hooks?.onConflict) {
                data = await this.config.hooks.onConflict(existing, data);
            }
        }
        const operation = {
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type,
            key,
            data,
            timestamp: Date.now(),
            retryCount: 0,
            version: ++this.versionCounter
        };
        this.syncQueue.push(operation);
        // Enforce queue size limit
        if (this.syncQueue.length > this.config.maxQueueSize) {
            this.syncQueue.shift(); // Remove oldest operation
        }
        await this.saveSyncQueue();
        if (this.isOnline) {
            this.processSyncQueue();
        }
    }
    async processSyncQueue() {
        if (this.syncInProgress || !this.isOnline || this.syncQueue.length === 0) {
            return;
        }
        this.syncInProgress = true;
        this.config.hooks?.onSyncStart?.();
        let successCount = 0;
        let failCount = 0;
        while (this.syncQueue.length > 0 && this.isOnline) {
            // Get batch of operations
            const batch = this.syncQueue.slice(0, this.config.batchSize);
            try {
                const results = await this.syncBatch(batch);
                // Process results
                for (let i = 0; i < batch.length; i++) {
                    const operation = batch[i];
                    const success = results[i];
                    if (success) {
                        this.syncQueue.shift();
                        successCount++;
                        this.config.hooks?.onSyncSuccess?.(operation);
                    }
                    else {
                        operation.retryCount++;
                        if (operation.retryCount >= this.config.maxRetries) {
                            this.syncQueue.shift();
                            failCount++;
                            const error = new Error('Max retries exceeded');
                            this.config.hooks?.onSyncError?.(operation, error);
                        }
                        else {
                            await this.delay(this.config.retryDelay);
                            break; // Stop processing batch on failure
                        }
                    }
                }
            }
            catch (error) {
                // Handle batch error
                for (const operation of batch) {
                    operation.retryCount++;
                    if (operation.retryCount >= this.config.maxRetries) {
                        this.syncQueue.shift();
                        failCount++;
                        this.config.hooks?.onSyncError?.(operation, error);
                    }
                }
                await this.delay(this.config.retryDelay);
            }
        }
        await this.saveSyncQueue();
        this.syncInProgress = false;
        this.config.hooks?.onSyncComplete?.(successCount, failCount);
    }
    async syncBatch(operations) {
        if (this.config.onSync) {
            return await this.config.onSync(operations);
        }
        // Default HTTP batch sync implementation
        const response = await fetch(this.config.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ operations })
        });
        if (response.ok) {
            const result = await response.json();
            return result.results || operations.map(() => true);
        }
        return operations.map(() => false);
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    getSyncQueue() {
        return [...this.syncQueue];
    }
    async clearSyncQueue() {
        this.syncQueue = [];
        await this.saveSyncQueue();
    }
    isOnlineStatus() {
        return this.isOnline;
    }
    // New utility methods
    getQueueSize() {
        return this.syncQueue.length;
    }
    addExcludeKey(key) {
        if (!this.config.excludeKeys?.includes(key)) {
            this.config.excludeKeys?.push(key);
        }
    }
    removeExcludeKey(key) {
        const index = this.config.excludeKeys?.indexOf(key);
        if (index !== undefined && index > -1) {
            this.config.excludeKeys?.splice(index, 1);
        }
    }
    async removeFromQueue(operationId) {
        const index = this.syncQueue.findIndex(op => op.id === operationId);
        if (index > -1) {
            this.syncQueue.splice(index, 1);
            await this.saveSyncQueue();
        }
    }
}
exports.SyncManager = SyncManager;
//# sourceMappingURL=SyncManager.js.map