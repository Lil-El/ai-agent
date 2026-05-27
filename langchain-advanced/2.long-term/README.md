## `createAgent` 参数

### context

context是 Agent 初始化时注入的、在整个 Agent 生命周期内可用的只读上下文数据。

用于：系统提示、权限、环境

### store

store是 Agent 的长期记忆，通过 namespace + key存取，最适合用户画像、偏好、业务知识。

开发时可以使用 `InMemoryStore`，生产时使用 `RedisStore` 或者 `PostgresStore`

> 可以在 tool、middleware 中使用 runtime

### checkpointer

当前对话（线程）的“短期记忆 / 状态持久化”

- 保存 Agent 的每一步状态​
- 支持 断点续跑 / 多轮对话 / 回滚 / 回溯

**同一个 thread_id= 同一次对话**

```js
const checkpointer = new MemorySaver();

await agent.invoke(
  { messages: [{ role: "user", content: "你好" }] },
  {
    configurable: {
      thread_id: "user_123", // ✅ 必须
    },
  }
);
```

- 生产环境使用：SqliteSaver、PostgresSaver
- 测试环境使用：MemorySaver