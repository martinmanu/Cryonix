import { IStorageEngine } from "../type/interface";

export class SessionStorageEngine implements IStorageEngine {
  async set(key: string, value: string): Promise<void> {
    sessionStorage.setItem(key, value);
  }

  async get(key: string): Promise<string | null> {
    return sessionStorage.getItem(key);
  }

  async remove(key: string): Promise<void> {
    sessionStorage.removeItem(key);
  }

  async clear(): Promise<void> {
    sessionStorage.clear();
  }

  async keys(): Promise<string[]> {
    return Object.keys(sessionStorage);
  }
}