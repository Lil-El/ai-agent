import { ChatOllama } from "@langchain/ollama";
import chalk from "chalk";

const model = new ChatOllama({
  model: "qwen3",
  baseUrl: "http://127.0.0.1:11434",
  streaming: true,
  think: false,
});

const start = Date.now();

model.invoke("你是谁？").then((stream) => {
  console.log("1.", (Date.now() - start) / 1000, "s");
  console.log(stream.content)
});
model.invoke("你是谁？").then((stream) => {
  console.log("2.", (Date.now() - start) / 1000, "s");
  console.log(stream.content)
});
model.invoke("你是谁？").then((stream) => {
  console.log("3.", (Date.now() - start) / 1000, "s");
  console.log(stream.content)
});
model.invoke("你是谁？").then((stream) => {
  console.log("4.", (Date.now() - start) / 1000, "s");
  console.log(stream.content)
});
