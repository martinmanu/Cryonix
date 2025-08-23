"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CookieEngine = void 0;
class CookieEngine {
    async set(key, value) {
        document.cookie = `${key}=${encodeURIComponent(value)}; path=/`;
    }
    async get(key) {
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
            const [cookieKey, cookieValue] = cookie.trim().split('=');
            if (cookieKey === key) {
                return decodeURIComponent(cookieValue);
            }
        }
        return null;
    }
    async remove(key) {
        document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
    }
    async clear() {
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
            const key = cookie.trim().split('=')[0];
            if (key) {
                document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
            }
        }
    }
    async keys() {
        const cookies = document.cookie.split(';');
        return cookies
            .map(cookie => cookie.trim().split('=')[0])
            .filter(key => key);
    }
}
exports.CookieEngine = CookieEngine;
//# sourceMappingURL=CookieEngine.js.map