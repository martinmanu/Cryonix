import { IStorageEngine } from "../type/interface";

export class LocalStorageEngine implements IStorageEngine {
  async set(key: string, value: string): Promise<void> {
    localStorage.setItem(key, value);
  }

  async get(key: string): Promise<string | null> {
    return localStorage.getItem(key);
  }

  async remove(key: string): Promise<void> {
    localStorage.removeItem(key);
  }

  async clear(): Promise<void> {
    localStorage.clear();
  }

  async keys(): Promise<string[]> {
    return Object.keys(localStorage);
  }
}