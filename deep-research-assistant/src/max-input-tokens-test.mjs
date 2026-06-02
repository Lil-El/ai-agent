/**
 * 上下文压缩这块，内置逻辑是每个模型有输入上下文限制，达到 85% 会触发总结，保留 10%
 * qwen 模型没这个，我们我们可以这样改
 * 可以实现对上下文压缩触发阈值的修改
 * 触发摘要后，会把会话原文记录在 conversation_history 目录下归档
 */

import "dotenv/config";
import { ChatOpenAI } from "@langchain/openai";

const model = new ChatOpenAI({
  model: process.env.OPENAI_MODEL,
  apiKey: process.env.OPENAI_API_KEY,
  temperature: 0,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL,
  },
});

console.log(model.profile.maxInputTokens);

Object.defineProperty(model, "profile", {
  get: () => ({ maxInputTokens: 131_072 }),
});

console.log(model.profile.maxInputTokens);
