import Redis from "ioredis";

const redis = new Redis({
  host: "127.0.0.1",
  port: 6379,
  db: 0,
});

redis.on("connect", () => {
  console.log("✅ ioredis 连接成功（mjs 版）");
});

redis.on("error", (err) => {
  console.error("❌ Redis 连接失败：", err);
});

async function run() {
  try {
    // String
    await redis.set("name", "Yann.");
    await redis.set("code", "123456", "EX", 60); // 设置过期时间为 60 秒

    console.log("String name:", await redis.get("name"));

    // Hash
    await redis.hset("user:1", "name", "Alice", "age", "30");
    console.log("Hash user:", await redis.hgetall("user:1"));

    // List
    await redis.lpush("task:list", "task1", "task2");
    await redis.rpush("task:list", "task3");
    console.log("List task:list:", await redis.lrange("task:list", 0, -1));

    // Set
    await redis.sadd("tag:set", "redis", "nodejs", "ioredis");
    console.log("Set tag:set:", await redis.smembers("tag:set"));

    // ZSet
    await redis.zadd("score:rank", 99, "Alice", 98, "Bob", 97, "Charlie");
    console.log("ZSet score:rank:", await redis.zrange("score:rank", 0, -1));

    // 分布式锁示例
    const lockKey = "lock:order:1001";
    const lockResult = await redis.set(lockKey, "locked", "NX", "EX", 10);
    console.log("分布式锁获取结果:", lockResult === "OK" ? "成功" : "失败");
  } catch (error) {
    console.error("执行 Redis 操作时出错：", error);
  }
}

run().then(() => {
  redis.quit();
});
