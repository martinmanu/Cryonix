import { Namespace } from "../type/interface";

export function createNamespace(prefix: string): Namespace {
  const cleanPrefix = prefix.trim();

  return {
    prefix: cleanPrefix,

    add(key: string): string {
      return `${cleanPrefix}:${key}`;
    },

    strip(key: string): string {
      return key.startsWith(cleanPrefix + ":")
        ? key.slice(cleanPrefix.length + 1)
        : key;
    }
  };
}
export { Namespace };

