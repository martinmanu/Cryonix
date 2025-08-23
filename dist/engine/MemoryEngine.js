"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryEngine = void 0;
class MemoryEngine {
    constructor() {
        this.store = new Map();
    }
    async set(key, value) {
        this.store.set(key, value);
    }
    async get(key) {
        return this.store.get(key) ?? null;
    }
    async remove(key) {
        this.store.delete(key);
    }
    async clear() {
        this.store.clear();
    }
    async keys() {
        return Array.from(this.store.keys());
    }
}
exports.MemoryEngine = MemoryEngine;
//# sourceMappingURL=MemoryEngine.js.map