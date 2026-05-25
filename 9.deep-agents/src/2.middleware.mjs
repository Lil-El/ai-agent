import "dotenv/config";
import { createAgent, createMiddleware, HumanMessage, ToolMessage, tool } from "langchain";
import { Command } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";

const getCurrentTime = tool(() => new Date().toLocaleString(), {
  name: "get_current_time",
  description: "获取当前时间",
  schema: z.object({}),
});

// 通过 middleware 注册工具，并用 wrapToolCall 包装执行
const extendedToolsMiddleware = createMiddleware({
  name: "ExtendedToolsMiddleware",
  stateSchema: z.object({
    toolInvocationCount: z.number().default(0),
  }),
  tools: [getCurrentTime],
  wrapToolCall: async (request, handler) => {
    const toolName = request.tool?.name ?? request.toolCall.name;
    console.log(`[ExtendedToolsMiddleware] 调用工具 ${toolName}`);

    const result = await handler(request);
    if (!ToolMessage.isInstance(result)) return result;

    const wrapped = new ToolMessage({
      content: `[${toolName}] ${result.content}`,
      tool_call_id: result.tool_call_id,
      name: result.name,
    });

    return new Command({
      update: {
        toolInvocationCount: request.state.toolInvocationCount + 1,
        messages: [wrapped],
      },
    });
  },
  afterAgent: (state) => {
    console.log(`[Logging] 模型调用结束`);
  },
});

const model = new ChatOpenAI({
  model: process.env.MODEL_NAME,
  apiKey: process.env.OPENAI_API_KEY,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL,
  },
  temperature: 0,
});

const agent = createAgent({
  model,
  tools: [],
  systemPrompt: "你是一个助手。",
  middleware: [extendedToolsMiddleware],
});

for (const text of ["给我当前时间"]) {
  console.log("\n用户:", text);
  const { messages, toolInvocationCount } = await agent.invoke({
    messages: [new HumanMessage(text)],
  });
  console.log("回复:", messages.at(-1)?.content);
  console.log("toolInvocationCount:", toolInvocationCount);
}
