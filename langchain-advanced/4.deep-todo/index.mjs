import "dotenv/config";
import { ChatOllama } from "@langchain/ollama";
import { HumanMessage } from "langchain";
import { createDeepAgent } from "deepagents";

const model = new ChatOllama({
  model: process.env.OLLAMA_MODEL_NAME,
  baseUrl: process.env.OLLAMA_BASE_URL,
  temperature: 0,
  think: false,
});

const agent = createDeepAgent({
  model,
  systemPrompt: `你是生活规划助手。收到需要多步完成的请求时，先用 write_todos 列出中文执行步骤，然后简要说明你的计划。`,
});

const query = "我下周末想带爸妈去杭州玩两天，帮我规划一下：交通怎么选、住哪里方便、必去景点和吃什么，预算控制在人均 1500 元左右。";

const stream = await agent.stream(
  {
    messages: [new HumanMessage(query)],
  },
  {
    subgraphs: true,
    streamMode: "updates",
    recursionLimit: 30, // 超过这个限制后，将不再被调用，以防止无限递归。
  },
);

for await (const [namespace, chunk] of stream) {
  console.log(`Namespace: ${namespace}`);
  console.log(`Chunk: ${JSON.stringify(chunk)}`);
}
