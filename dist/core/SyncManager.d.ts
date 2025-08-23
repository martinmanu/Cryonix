import { IStorageEngine, SyncOperation, SyncConfig } from "../type/interface";
export declare class SyncManager {
    private engine;
    private config;
    private syncQueue;
    private isOnline;
    private syncInProgress;
    private versionCounter;
    constructor(engine: IStorageEngine, config: SyncConfig);
    private setupNetworkListeners;
    private loadSyncQueue;
    private saveSyncQueue;
    queueOperation(type: SyncOperation['type'], key: string, data?: any): Promise<void>;
    processSyncQueue(): Promise<void>;
    private syncBatch;
    private delay;
    getSyncQueue(): SyncOperation[];
    clearSyncQueue(): Promise<void>;
    isOnlineStatus(): boolean;
    getQueueSize(): number;
    addExcludeKey(key: string): void;
    removeExcludeKey(key: string): void;
    removeFromQueue(operationId: string): Promise<void>;
}
//# sourceMappingURL=SyncManager.d.ts.map