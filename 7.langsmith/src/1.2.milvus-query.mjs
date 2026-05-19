import "dotenv/config";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Milvus } from "@langchain/community/vectorstores/milvus";
import { MetricType } from "@zilliz/milvus2-sdk-node";

const COLLECTION_NAME = "rag_docs";

const embeddings = new OpenAIEmbeddings({
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.EMBEDDINGS_MODEL_NAME,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL,
  },
});

const vectorStore = await Milvus.fromExistingCollection(embeddings, {
  collectionName: COLLECTION_NAME,
  url: "http://127.0.0.1:19530",
});

await vectorStore.client.loadCollection({ collection_name: COLLECTION_NAME });

// ----------  语义检索  ------------
// 价保多久？
const v = await embeddings.embedQuery("hello"); // v.length === 1024

// milvus 关于价保的文档片段和它所在的文档的语义相似度较低，导致无法进入topk的结果集；
// 调整 nlist 和 nprobe 参数也无法解决，修改索引类型也无效；
const r = await vectorStore.client.search({
  collection_name: COLLECTION_NAME,
  data: v,
  // params: { nprobe: 16 },
  limit: 2,
  output_fields: ["langchain_primaryid", "sparse_vector"],
});

console.log(r);

// -----------  混合检索  ------------
// 故使用混合检索方式，精确匹配文档片段；
// const denseVector = await embeddings.embedQuery("hello");
// const res = await vectorStore.client.hybridSearch({
//   collection_name: COLLECTION_NAME,
//   data: [{}],
//   rerank: {
//     strategy: "rrf",
//     params: { k: 60 },
//   },
//   limit: 4,
// });

// console.log(res);


await vectorStore.client.dropCollectionFunction({ collection_name: COLLECTION_NAME, function_name: "my_function" });

const coll = await vectorStore.client.describeCollection({
  collection_name: "rag_docs",
});

console.log(coll);
