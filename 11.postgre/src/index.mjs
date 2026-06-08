import { pool } from "./db.mjs";
import * as users from "./users.mjs";
import * as conversations from "./conversations.mjs";
import * as messages from "./messages.mjs";

async function run() {
  console.log("=== 用户 CRUD ===");

  const user = await users.createUser("Yann");
  console.log("新增用户:", user);

  const fetchedUser = await users.getUserById(user.id);
  console.log("获取用户:", fetchedUser);

  const updatedUser = await users.updateUser(user.id, "Mino");
  console.log("更新用户:", updatedUser);

  console.log("\n=== 会话 CRUD ===");

  const conversation = await conversations.createConversation(user.id, "第一次对话");
  console.log("新增会话:", conversation);

  const userConversations = await conversations.getConversationsByUserId(user.id);
  console.log("获取用户会话:", userConversations);

  const updatedConversation = await conversations.updateConversation(conversation.id, { title: "第二次对话" });
  console.log("更新会话:", updatedConversation);

  console.log("\n=== 消息 CRUD ===");

  const userMessage = await messages.createMessage(conversation.id, "user", "你好，介绍一下PostgreSQL");
  console.log("新增用户消息:", userMessage);

  const assistantMessage = await messages.createMessage(
    conversation.id,
    "assistant",
    "PostgreSQL是一种开源的关系型数据库管理系统。",
  );
  console.log("新增助手消息:", assistantMessage);

  const conversationMessages = await messages.getMessagesByConversationId(conversation.id);
  console.log("会话消息列表:", conversationMessages);

  const updatedMessage = await messages.updateMessage(userMessage.id, "你好，介绍一下pgvector");
  console.log("更新用户消息:", updatedMessage);

  console.log("\n === 语义检索 ===");

  const seedMessages = [
    { role: "user", content: "PostgreSQL 支持哪些数据类型？" },
    {
      role: "assistant",
      content: "PostgreSQL 支持整数、文本、JSON、数组，以及 pgvector 扩展提供的向量类型。",
    },
    {
      role: "user",
      content: "怎么做相似度搜索？",
    },
    {
      role: "assistant",
      content: "使用 pgvector 的 cosine 距离运算符 <=>，配合 hnsw 索引加速向量检索。",
    },
  ];

  for (const msg of seedMessages) {
    await messages.createMessage(conversation.id, msg.role, msg.content, true);
  }

  console.log(`写入${seedMessages.length}条数据成功！`);

  const searchQueries = ["向量相似度怎么查", "关系型数据库有哪些类型"];

  for (const searchText of searchQueries) {
    console.log("\n搜索：" + searchText);
    const results = await messages.searchSimilarMessages(conversation.id, searchText, 3);

    if (results.length === 0) {
      console.log("  无匹配结果");
      continue;
    }

    for (const [i, row] of results.entries()) {
      console.log(`  ${i + 1}. [${row.role}] ${row.content} (similarity: ${Number(row.similarity).toFixed(4)})`);
    }
  }

  console.log("\n=== 清理 ===");

  await messages.deleteMessage(assistantMessage.id);
  await messages.deleteMessage(updatedMessage.id);
  await conversations.deleteConversation(conversation.id);
  await users.deleteUser(user.id);

  console.log("演示数据已清理");
}

run()
  .catch((err) => {
    console.error("运行失败:", err.message);
    process.exit(1);
  })
  .finally(() => pool.end());

export { users, conversations, messages };
