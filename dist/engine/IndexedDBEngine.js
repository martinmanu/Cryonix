"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndexedDBEngine = void 0;
class IndexedDBEngine {
    constructor(dbName = 'CryonixDB', storeName = 'keyvalue', version = 1) {
        this.dbPromise = null;
        this.dbName = dbName;
        this.storeName = storeName;
        this.version = version;
    }
    async openDB() {
        if (!this.dbPromise) {
            this.dbPromise = new Promise((resolve, reject) => {
                const request = indexedDB.open(this.dbName, this.version);
                request.onerror = () => reject(request.error);
                request.onsuccess = () => resolve(request.result);
                request.onupgradeneeded = () => {
                    const db = request.result;
                    if (!db.objectStoreNames.contains(this.storeName)) {
                        db.createObjectStore(this.storeName);
                    }
                };
            });
        }
        return this.dbPromise;
    }
    async set(key, value) {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            transaction.onerror = () => reject(transaction.error);
            transaction.oncomplete = () => resolve();
            store.put(value, key);
        });
    }
    async get(key) {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(key);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result || null);
        });
    }
    async remove(key) {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            transaction.onerror = () => reject(transaction.error);
            transaction.oncomplete = () => resolve();
            store.delete(key);
        });
    }
    async clear() {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            transaction.onerror = () => reject(transaction.error);
            transaction.oncomplete = () => resolve();
            store.clear();
        });
    }
    async keys() {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.getAllKeys();
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }
}
exports.IndexedDBEngine = IndexedDBEngine;
//# sourceMappingURL=IndexedDBEngine.js.map