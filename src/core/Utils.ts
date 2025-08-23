// utils.ts
import CryptoJS from "crypto-js";

export class Utils {

  static encode<T>(value: T): string {
    return JSON.stringify(value);
  }

  static decode<T>(data: string): T {
    return JSON.parse(data) as T;
  }


   //Encrypt value using AES

  static async encrypt<T>(value: T, secret: string): Promise<string> {
    const stringified = JSON.stringify(value);
    const encrypted = CryptoJS.AES.encrypt(stringified, secret).toString();
    return encrypted;
  }

   // Decrypt AES string back into object
  static async decrypt<T>(ciphertext: string, secret: string): Promise<T> {
    const bytes = CryptoJS.AES.decrypt(ciphertext, secret);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    if (!decrypted) {
      throw new Error("Failed to decrypt — possibly wrong secret");
    }

    return JSON.parse(decrypted) as T;
  }
}
