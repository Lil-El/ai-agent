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
await client.loadCollection({ collection_name: COLLECTION_NAME });
await client.releaseCollection({ collection_name: COLLECTION_NAME });

// await client.dropIndex({
//   collection_name: COLLECTION_NAME,
// });

/* ---------- 2. Dense 向量索引（小数据最优解） ---------- */
// await client.createIndex({
//   collection_name: COLLECTION_NAME,
//   field_name: "langchain_vector",
//   index_type: IndexType.FLAT,
//   metric_type: MetricType.L2,
// });

/* ---------- 3. 新增 Sparse 字段 ---------- */
try {
  const res = await client.addCollectionField({
    collection_name: COLLECTION_NAME,
    field: {
      name: "age",
      data_type: DataType.Int8,
      is_primary_key: false,
    },
  });

  console.log(res);
} catch (error) {
  console.log("字段已存在");
}

/* ---------- 4. Sparse 向量索引（✅ 正确姿势） ---------- */
// await client.createIndex({
//   collection_name: COLLECTION_NAME,
//   field_name: "sparse_vector",
//   index_type: IndexType.SPARSE_INVERTED_INDEX,
//   metric_type: MetricType.IP, // ✅ 必须是 IP
//   params: {
//     drop_ratio_build: 0.2, // ✅ 稀疏剪枝
//   },
// });

// 添加 BM25 函数（text → sparse_vector）
// await client.addCollectionFunction({
//   collection_name: COLLECTION_NAME,
//   function: {
//     name: "my_function",
//     type: FunctionType.BM25,
//     input_field_names: ["langchain_text"],
//     output_field_names: ["sparse_vector"],
//     params: {},
//   },
// });

// const data = [
//   {
//     langchain_text: "hello world",
//     langchain_vector: await embeddings.embedQuery("hello world"),
//     source: "jiwon"
//   },
// ];

// await client.insert({
//   collection_name: COLLECTION_NAME,
//   data,
// });

await client.loadCollection({ collection_name: COLLECTION_NAME });
