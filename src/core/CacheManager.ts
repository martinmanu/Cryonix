
import { IStorageEngine , CacheManagerOptions, Namespace} from "../type/interface";
import { createNamespace } from "./Namespace"
import { Utils } from "./Utils";


export class CacheManager {
  private engine: IStorageEngine;
  private namespace?: Namespace;
  private secure: boolean;
  private secret?: string;

  constructor(engine: IStorageEngine, options?: CacheManagerOptions) {
    this.engine = engine;
    this.secure = options?.secure ?? false;
    this.secret = options?.secret;
    this.namespace = options?.namespace ? createNamespace(options.namespace) : undefined;
  }

  private withNamespace(key: string): string {
    return this.namespace ? this.namespace.add(key) : key;
  }

  async set<T>(key: string, value: T): Promise<void> {
    const finalKey = this.withNamespace(key);

    if (this.secure && this.secret) {
      const encrypted = await Utils.encrypt(value, this.secret);
      await this.engine.set(finalKey, encrypted);
    } else {
      const encoded = Utils.encode(value);
      await this.engine.set(finalKey, encoded);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const finalKey = this.withNamespace(key);
    const data = await this.engine.get(finalKey);
    if (!data) return null;

    if (this.secure && this.secret) {
      return await Utils.decrypt<T>(data, this.secret);
    } else {
      return Utils.decode<T>(data);
    }
  }

  async remove(key: string): Promise<void> {
    const finalKey = this.withNamespace(key);
    await this.engine.remove(finalKey);
  }

  async clear(): Promise<void> {
    if (this.namespace) {
      // Clear only items within this namespace
      const keys = await this.engine.keys();
      const nsKeys = keys.filter((k) => k.startsWith(this.namespace!.prefix + ":"));
      for (const k of nsKeys) {
        await this.engine.remove(k);
      }
    } else {
      // Clear everything
      await this.engine.clear();
    }
  }
}
