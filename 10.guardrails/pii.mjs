import "dotenv/config";
import { ChatOllama } from "@langchain/ollama";
import { createAgent, piiMiddleware } from "langchain";

const model = new ChatOllama({
  model: "qwen3",
  baseUrl: "http://localhost:11434",
  temperature: 0,
  think: false,
});

const agent = createAgent({
  model,
  tools: [],
  middleware: [
    piiMiddleware("email", {
      strategy: "redact",
      detector: (text) => {
        const EMAIL = "yxd99324@qq.com";
        if (text.includes(EMAIL)) {
          return [
            {
              text: EMAIL,
              start: text.indexOf(EMAIL),
              end: text.indexOf(EMAIL) + EMAIL.length,
            },
          ];
        } else return [];
      },
      applyToInput: true,
      applyToOutput: false,
      applyToToolResults: false,
    }),
    // piiMiddleware("email", { strategy: "redact" }),
    piiMiddleware("credit_card", {
      strategy: "mask",
      applyToInput: true,
    }),
    piiMiddleware("api_key", {
      detector: /sk-[a-zA-Z0-9]{32}/,
      strategy: "block",
      applyToInput: true,
    }),
  ],
});

const res = await agent.invoke({
  messages: ["My email is yxd99324@qq.com and card is 5105-1051-0510-5100"],
});

console.log(res);
