// langsmith 会自动监听，然后对 graph 各个节点设置回调并异步上传

import "dotenv/config";
import { ask } from "./2.rag_agent.mjs";

const DEFAULT_QUESTIONS = [
  // "优惠券使用规则？"
  "价保多久？"
  // "无理由退货要在几天内？",
  // "满多少元包邮？",
  // "金卡会员有什么折扣？",
  // "电子发票多久能开好？",
  // "手机保修多久？",
  // "紧急问题怎么联系客服？",
  // "消费1元积多少积分？"
];

const args = process.argv.slice(2);
const questions = args.length > 0 ? [args.join(" ")] : DEFAULT_QUESTIONS;

// 问题会自动 Trace 到 LangSmith
for (let i = 0; i < questions.length; i++) {
  const question = questions[i];
  console.log(`\n${"=".repeat(50)}`);
  console.log(`问题 ${i + 1}: ${question}`);

  const { answer, context } = await ask(question);
  console.log(`\n答: ${answer}`);
}

console.log(`\n${"=".repeat(50)}`);
console.log(`共 ${questions.length} 个问题`);
