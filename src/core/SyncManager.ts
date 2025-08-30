import { IStorageEngine, SyncOperation, SyncConfig, ConflictResolution } from "../type/interface";

export class SyncManager {
  private engine: IStorageEngine;
  private config: SyncConfig;
  private syncQueue: SyncOperation[] = [];
  private isOnline: boolean = navigator.onLine;
  private syncInProgress: boolean = false;
  private versionCounter: number = 0;

  constructor(engine: IStorageEngine, config: SyncConfig) {
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

  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processSyncQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  private async loadSyncQueue(): Promise<void> {
    try {
      const queueData = await this.engine.get(this.config.syncKey!);
      if (queueData) {
        this.syncQueue = JSON.parse(queueData);
      }
    } catch (error) {
      console.warn('Failed to load sync queue:', error);
    }
  }

  private async saveSyncQueue(): Promise<void> {
    try {
      await this.engine.set(this.config.syncKey!, JSON.stringify(this.syncQueue));
    } catch (error) {
      console.warn('Failed to save sync queue:', error);
    }
  }

  async queueOperation(type: SyncOperation['type'], key: string, data?: any): Promise<void> {
    if (this.config.excludeKeys?.includes(key)) {
      return;
    }

    const existingIndex = this.syncQueue.findIndex(op => op.key === key);
    if (existingIndex !== -1) {
      const existing = this.syncQueue[existingIndex];
      if (this.config.conflictResolution === 'last-write-wins') {
        this.syncQueue.splice(existingIndex, 1);
      } else if (this.config.conflictResolution === 'merge' && this.config.hooks?.onConflict) {
        data = await this.config.hooks.onConflict(existing, data);
      }
    }

    const operation: SyncOperation = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      key,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      version: ++this.versionCounter
    };

    this.syncQueue.push(operation);
    
    if (this.syncQueue.length > this.config.maxQueueSize!) {
      this.syncQueue.shift();
    }

    await this.saveSyncQueue();

    if (this.isOnline) {
      this.processSyncQueue();
    }
  }

  async processSyncQueue(): Promise<void> {
    if (this.syncInProgress || !this.isOnline || this.syncQueue.length === 0) {
      return;
    }

    this.syncInProgress = true;
    this.config.hooks?.onSyncStart?.();

    let successCount = 0;
    let failCount = 0;

    while (this.syncQueue.length > 0 && this.isOnline) {
      const batch = this.syncQueue.slice(0, this.config.batchSize!);
      
      try {
        const results = await this.syncBatch(batch);
        
        for (let i = 0; i < batch.length; i++) {
          const operation = batch[i];
          const success = results[i];
          
          if (success) {
            this.syncQueue.shift();
            successCount++;
            this.config.hooks?.onSyncSuccess?.(operation);
          } else {
            operation.retryCount++;
            if (operation.retryCount >= this.config.maxRetries!) {
              this.syncQueue.shift();
              failCount++;
              const error = new Error('Max retries exceeded');
              this.config.hooks?.onSyncError?.(operation, error);
            } else {
              await this.delay(this.config.retryDelay!);
              break;
            }
          }
        }
      } catch (error) {
        for (const operation of batch) {
          operation.retryCount++;
          if (operation.retryCount >= this.config.maxRetries!) {
            this.syncQueue.shift();
            failCount++;
            this.config.hooks?.onSyncError?.(operation, error as Error);
          }
        }
        await this.delay(this.config.retryDelay!);
      }
    }

    await this.saveSyncQueue();
    this.syncInProgress = false;
    this.config.hooks?.onSyncComplete?.(successCount, failCount);
  }

  private async syncBatch(operations: SyncOperation[]): Promise<boolean[]> {
    if (this.config.onSync) {
      return await this.config.onSync(operations);
    }

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

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getSyncQueue(): SyncOperation[] {
    return [...this.syncQueue];
  }

  async clearSyncQueue(): Promise<void> {
    this.syncQueue = [];
    await this.saveSyncQueue();
  }

  isOnlineStatus(): boolean {
    return this.isOnline;
  }

  getQueueSize(): number {
    return this.syncQueue.length;
  }

  addExcludeKey(key: string): void {
    if (!this.config.excludeKeys?.includes(key)) {
      this.config.excludeKeys?.push(key);
    }
  }

  removeExcludeKey(key: string): void {
    const index = this.config.excludeKeys?.indexOf(key);
    if (index !== undefined && index > -1) {
      this.config.excludeKeys?.splice(index, 1);
    }
  }

  async removeFromQueue(operationId: string): Promise<void> {
    const index = this.syncQueue.findIndex(op => op.id === operationId);
    if (index > -1) {
      this.syncQueue.splice(index, 1);
      await this.saveSyncQueue();
    }
  }
}