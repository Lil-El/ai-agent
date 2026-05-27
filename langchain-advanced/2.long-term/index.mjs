import "dotenv/config";
import { ChatOllama } from "@langchain/ollama";
import { tool, createAgent, createMiddleware } from "langchain";
import { InMemoryStore } from "@langchain/langgraph";
import { z } from "zod";

const model = new ChatOllama({
  model: "qwen3",
  baseUrl: "http://localhost:11434",
  temperature: 0,
  think: false,
});

const savePreference = tool(
  async (input, runtime) => {
    const userId = runtime.context.userId;

    const { topic, value } = input;

    try {
      await runtime.store.put(
        ["users", userId], // namespace
        "preferences", // key
        { [topic]: value }, // value
      );

      const item = await runtime.store.get(["users", userId], "preferences");
    } catch (error) {
      console.error(error);
    }

    return `已保存 ${topic}：${value}`;
  },
  {
    name: "save_preference",
    schema: z.object({
      topic: z.string(),
      value: z.string(),
    }),
  },
);

const getPreference = tool(
  async (input, runtime) => {
    const userId = runtime.context.userId;

    const prefs = await runtime.store.get(["users", userId], "preferences");

    return prefs ?? "暂无偏好记录";
  },
  {
    name: "get_preference",
    schema: z.object({}),
  },
);

const store = new InMemoryStore();

const contextSchema = z.object({
  env: z.string(),
  userId: z.string(),
});

const configurable = {
  thread_id: "1",
};

const agent = createAgent({
  model,
  tools: [savePreference, getPreference],
  contextSchema,
  store,
  middleware: [
    createMiddleware({
      name: "LogMiddleware",
      contextSchema,
      beforeModel: async (input, runtime) => {
        // console.log(`${runtime.context.env} 调用模型`);
      },
    }),
  ],
});

let res = await agent.invoke(
  {
    messages: [["human", "记住我的爱好是 读书"]],
  },
  {
    context: {
      env: "dev",
      userId: "993240817",
    },
    configurable,
  },
);

console.log(res.messages.at(-1).content);

res = await agent.invoke(
  {
    messages: [["human", "我的爱好是什么？"]],
  },
  {
    context: {
      env: "dev",
      userId: "993240817",
    },
    configurable,
  },
);

console.log(res.messages.at(-1).content);
