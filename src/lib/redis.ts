import Redis from "ioredis";

declare global {
  // eslint-disable-next-line no-var
  var __redis__: Redis | undefined;
}

function createRedisClient() {
  const url = process.env.REDIS_URL;

  if (!url) {
    throw new Error("REDIS_URL belum diisi");
  }

  return new Redis(url, {
    maxRetriesPerRequest: 2,
    enableReadyCheck: true,
    lazyConnect: true,
  });
}

export const redis = global.__redis__ || createRedisClient();

if (process.env.NODE_ENV !== "production") {
  global.__redis__ = redis;
}