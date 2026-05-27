// 自定义 HITL 逻辑，可以参考 1.agent-learn\graph\6.graph-interrupt.mjs

import "dotenv/config";
import { ChatOllama } from "@langchain/ollama";
import { MemorySaver, Command } from "@langchain/langgraph";
import { createAgent, humanInTheLoopMiddleware, tool } from "langchain";
import { z } from "zod";
import { createInterface } from "node:readline/promises";

const model = new ChatOllama({
  model: "qwen3",
  baseUrl: "http://localhost:11434",
  temperature: 0,
  think: false,
});

const getTime = tool(() => new Date().toLocaleString(), {
  name: "get_time",
  description: "获取当前时间",
  schema: z.object({}),
});

const agent = createAgent({
  model,
  tools: [getTime],
  middleware: [
    humanInTheLoopMiddleware({
      interruptOn: {
        get_time: {
          allowedDecisions: ["approve", "reject"],
          description: (toolCall, state, runtime) => {
            return `请确认是否需要获取当前时间，如果确认请输入approve，如果不需要请输入reject。`;
          },
        },
      },
    }),
  ],
  checkpointer: new MemorySaver(),
});

const res = await agent.invoke(
  { messages: [["human", "请获取当前时间"]] },
  {
    configurable: {
      thread_id: "1",
    },
  },
);

console.log("\n待你确认：", res.__interrupt__?.[0]?.value);

const rl = createInterface(process.stdin, process.stdout);

const line = await rl.question("请输入ok/no：");

await rl.close();

// Command：type = edit 时，需要提供 editedAction 新的 tool args
if (line === "ok") {
  const done = await agent.invoke(new Command({ resume: { decisions: [{ type: "approve" }] } }), {
    configurable: { thread_id: "1" },
  });
  console.log("\n回复：", done);
} else if (line === "no") {
  const done = await agent.invoke(new Command({ resume: { decisions: [{ type: "reject", message: "拒绝" }] } }), {
    configurable: { thread_id: "1" },
  });
  console.log("\n回复：", done);
}
