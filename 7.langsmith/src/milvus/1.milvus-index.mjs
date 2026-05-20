// 针对 1.milvus-insert.mjs 修改索引参数和类型，并新增一个索引用于混合检索
import "dotenv/config";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MilvusClient, IndexType, MetricType, DataType, FunctionType } from "@zilliz/milvus2-sdk-node";

const COLLECTION_NAME = "rag_docs";
const client = new MilvusClient({ address: "localhost:19530" });

const embeddings = new OpenAIEmbeddings({
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.EMBEDDINGS_MODEL_NAME,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL,
  },
});

await client.connectPromise;

/* ---------- 1. 释放并删除旧索引 ---------- */
await client.releaseCollection({ collection_name: COLLECTION_NAME });

await client.dropIndex({
  collection_name: COLLECTION_NAME,
  index_name: "text_dense_index",
});

/* ---------- 2. 创建索引 ---------- */
const alterIndexRes = await client.createIndex({
  collection_name: COLLECTION_NAME,
  field_name: "dense_vector",
  index_name: "text_dense_index",
  index_type: IndexType.FLAT,
  metric_type: MetricType.COSINE,
  params: {},
});

// 有索引才可以加载
await client.loadCollection({ collection_name: COLLECTION_NAME });

console.log("alterIndexRes: ", alterIndexRes);

// 获取索引信息
const index = await client.describeIndex({ collection_name: COLLECTION_NAME });

console.log(index);
