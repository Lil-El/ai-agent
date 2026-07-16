/**
 * 图像编辑 — wan2.6-image
 * dashscope-sdk-official
 */

import "dotenv/config";
import { writeFileSync } from "node:fs";
import { Configuration, MultiModalConversation } from "dashscope-sdk-official";

const imageUrl = "https://yann-agent-bucket.oss-cn-beijing.aliyuncs.com/%E5%8E%9F%E5%A7%8B.jpg";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

// 万相图像编辑走 DashScope 原生 multimodal-generation，不能用 ChatOpenAI
const client = new MultiModalConversation(configuration);

const result = await client.call({
  model: "wan2.7-image",
  watermark: false,
  n: 1,
  size: "1K",
  messages: [
    {
      role: "user",
      content: [{ text: "给任务的眼睛改为蓝色的瞳色" }, { image: imageUrl }],
    },
  ],
});

if (result.status_code !== 200 || result.code) {
  throw new Error(result.message ?? `Request failed: ${result.status_code}`);
}

const resultUrl = result.output?.choices?.[0]?.message?.content?.[0]?.image;
if (!resultUrl) {
  throw new Error(`No image URL in response: ${JSON.stringify(result)}`);
}

// https://bailian.console.aliyun.com/cn-beijing?tab=api#/api/?type=model&url=3026980 万向图像编辑模型文档
console.log("model: wan2.7-image");
console.log("edited image URL:", resultUrl);

const imageResponse = await fetch(resultUrl);
writeFileSync("output-wan-image-edit.png", Buffer.from(await imageResponse.arrayBuffer()));
console.log("Saved to output-wan-image-edit.png");
