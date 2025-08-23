"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndexedDBEngine = exports.CookieEngine = exports.SessionStorageEngine = exports.LocalStorageEngine = exports.MemoryEngine = exports.Utils = exports.createNamespace = exports.CacheManager = void 0;
exports.createCache = createCache;
// Core exports
var CacheManager_1 = require("./core/CacheManager");
Object.defineProperty(exports, "CacheManager", { enumerable: true, get: function () { return CacheManager_1.CacheManager; } });
var Namespace_1 = require("./core/Namespace");
Object.defineProperty(exports, "createNamespace", { enumerable: true, get: function () { return Namespace_1.createNamespace; } });
var Utils_1 = require("./core/Utils");
Object.defineProperty(exports, "Utils", { enumerable: true, get: function () { return Utils_1.Utils; } });
// Engine exports
var MemoryEngine_1 = require("./engine/MemoryEngine");
Object.defineProperty(exports, "MemoryEngine", { enumerable: true, get: function () { return MemoryEngine_1.MemoryEngine; } });
var LocalStorageEngine_1 = require("./engine/LocalStorageEngine");
Object.defineProperty(exports, "LocalStorageEngine", { enumerable: true, get: function () { return LocalStorageEngine_1.LocalStorageEngine; } });
var SessionStorageEngine_1 = require("./engine/SessionStorageEngine");
Object.defineProperty(exports, "SessionStorageEngine", { enumerable: true, get: function () { return SessionStorageEngine_1.SessionStorageEngine; } });
var CookieEngine_1 = require("./engine/CookieEngine");
Object.defineProperty(exports, "CookieEngine", { enumerable: true, get: function () { return CookieEngine_1.CookieEngine; } });
var IndexedDBEngine_1 = require("./engine/IndexedDBEngine");
Object.defineProperty(exports, "IndexedDBEngine", { enumerable: true, get: function () { return IndexedDBEngine_1.IndexedDBEngine; } });
// Type exports
__exportStar(require("./type/interface"), exports);
const CacheManager_2 = require("./core/CacheManager");
const LocalStorageEngine_2 = require("./engine/LocalStorageEngine");
const SessionStorageEngine_2 = require("./engine/SessionStorageEngine");
const MemoryEngine_2 = require("./engine/MemoryEngine");
function createCache(options = {}) {
    const backend = options.backend ?? "memory";
    const namespace = options.namespace ?? "default";
    let engine;
    switch (backend) {
        case "local":
            engine = new LocalStorageEngine_2.LocalStorageEngine();
            break;
        case "session":
            engine = new SessionStorageEngine_2.SessionStorageEngine();
            break;
        case "memory":
        default:
            engine = new MemoryEngine_2.MemoryEngine();
            break;
    }
    return new CacheManager_2.CacheManager(engine, { namespace });
}
//# sourceMappingURL=index.js.map