"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalStorageEngine = void 0;
class LocalStorageEngine {
    async set(key, value) {
        localStorage.setItem(key, value);
    }
    async get(key) {
        return localStorage.getItem(key);
    }
    async remove(key) {
        localStorage.removeItem(key);
    }
    async clear() {
        localStorage.clear();
    }
    async keys() {
        return Object.keys(localStorage);
    }
}
exports.LocalStorageEngine = LocalStorageEngine;
//# sourceMappingURL=LocalStorageEngine.js.map