import { IStorageEngine } from "../type/interface";

export class CookieEngine implements IStorageEngine {
  async set(key: string, value: string): Promise<void> {
    document.cookie = `${key}=${encodeURIComponent(value)}; path=/`;
  }

  async get(key: string): Promise<string | null> {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [cookieKey, cookieValue] = cookie.trim().split('=');
      if (cookieKey === key) {
        return decodeURIComponent(cookieValue);
      }
    }
    return null;
  }

  async remove(key: string): Promise<void> {
    document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
  }

  async clear(): Promise<void> {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const key = cookie.trim().split('=')[0];
      if (key) {
        document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
      }
    }
  }

  async keys(): Promise<string[]> {
    const cookies = document.cookie.split(';');
    return cookies
      .map(cookie => cookie.trim().split('=')[0])
      .filter(key => key);
  }
}
