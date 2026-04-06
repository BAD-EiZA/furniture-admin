import { redis } from "@/lib/redis";

export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const raw = await redis.get(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error("GET_CACHE_ERROR", key, error);
    return null;
  }
}

export async function setCache<T>(
  key: string,
  value: T,
  ttlSeconds = 300,
): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch (error) {
    console.error("SET_CACHE_ERROR", key, error);
  }
}

export async function deleteCache(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (error) {
    console.error("DELETE_CACHE_ERROR", key, error);
  }
}

export async function deleteCacheByPattern(pattern: string): Promise<void> {
  try {
    const stream = redis.scanStream({
      match: pattern,
      count: 100,
    });

    const keys: string[] = [];

    await new Promise<void>((resolve, reject) => {
      stream.on("data", (resultKeys: string[]) => {
        for (const key of resultKeys) {
          keys.push(key);
        }
      });

      stream.on("end", () => resolve());
      stream.on("error", reject);
    });

    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error("DELETE_CACHE_BY_PATTERN_ERROR", pattern, error);
  }
}
