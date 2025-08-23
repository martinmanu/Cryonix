"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utils = void 0;
// utils.ts
const crypto_js_1 = __importDefault(require("crypto-js"));
class Utils {
    static encode(value) {
        return JSON.stringify(value);
    }
    static decode(data) {
        return JSON.parse(data);
    }
    //Encrypt value using AES
    static async encrypt(value, secret) {
        const stringified = JSON.stringify(value);
        const encrypted = crypto_js_1.default.AES.encrypt(stringified, secret).toString();
        return encrypted;
    }
    // Decrypt AES string back into object
    static async decrypt(ciphertext, secret) {
        const bytes = crypto_js_1.default.AES.decrypt(ciphertext, secret);
        const decrypted = bytes.toString(crypto_js_1.default.enc.Utf8);
        if (!decrypted) {
            throw new Error("Failed to decrypt — possibly wrong secret");
        }
        return JSON.parse(decrypted);
    }
}
exports.Utils = Utils;
//# sourceMappingURL=Utils.js.map