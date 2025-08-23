"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionStorageEngine = void 0;
class SessionStorageEngine {
    async set(key, value) {
        sessionStorage.setItem(key, value);
    }
    async get(key) {
        return sessionStorage.getItem(key);
    }
    async remove(key) {
        sessionStorage.removeItem(key);
    }
    async clear() {
        sessionStorage.clear();
    }
    async keys() {
        return Object.keys(sessionStorage);
    }
}
exports.SessionStorageEngine = SessionStorageEngine;
//# sourceMappingURL=SessionStorageEngine.js.map