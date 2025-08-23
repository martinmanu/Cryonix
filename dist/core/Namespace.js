"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNamespace = createNamespace;
function createNamespace(prefix) {
    const cleanPrefix = prefix.trim();
    return {
        prefix: cleanPrefix,
        add(key) {
            return `${cleanPrefix}:${key}`;
        },
        strip(key) {
            return key.startsWith(cleanPrefix + ":")
                ? key.slice(cleanPrefix.length + 1)
                : key;
        }
    };
}
//# sourceMappingURL=Namespace.js.map