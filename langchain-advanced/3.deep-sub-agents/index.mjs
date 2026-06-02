import "dotenv/config";
import { ChatOllama } from "@langchain/ollama";
import { HumanMessage } from "langchain";
import { createDeepAgent, FilesystemBackend } from "deepagents";
import path from "path";
import { fileURLToPath } from "url";

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

console.log(`Project directory: ${projectDir}`);

const model = new ChatOllama({
  model: process.env.OLLAMA_MODEL_NAME,
  baseUrl: process.env.OLLAMA_BASE_URL,
  temperature: 0,
  think: false,
});

const agent = createDeepAgent({
  model,
  // skills: ["/3.deep-sub-agents/skills/"],
  // memory: [], // Memory is loaded at agent startup and added into the system prompt.
  systemPrompt: `你是城市百科调度者，你不负责生成内容，只负责调用子代理。

    # 流程
    1. 必须先使用 write_todos 将用户输入的内容拆解成多个子问题（todos），并写入到 /workspace/todos.json 中。
    2. 根据不同问题调用对应的 sub agents 来处理

    # sub agents
    - introduction_agent：一句话介绍城市
    - history_agent：简单描述城市历史

    `,
  backend: new FilesystemBackend({ rootDir: projectDir, virtualMode: true }),
  subagents: [
    {
      name: "introduction_agent",
      description: "一句话介绍城市，并写入到文件（/workspace/city.md）中。",
      systemPrompt: `
        使用中文一句话介绍城市。

        将内容写入到文件（/workspace/city.md）中。
      `,
    },
    {
      name: "history_agent",
      description: "描述城市历史，并写入到文件（/workspace/history.md）中。",
      systemPrompt: "使用中文描述城市的历史，并将写入到文件（/workspace/history.md）中。",
    },
  ],
});

const query = "介绍一下大同的基本情况和历史。";

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
