import "dotenv/config";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Milvus } from "@langchain/community/vectorstores/milvus";
import { FunctionType, MetricType } from "@zilliz/milvus2-sdk-node";

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
const v = await embeddings.embedQuery("价保多久？"); // v.length === 1024

// milvus 关于价保的文档片段和它所在的文档的语义相似度较低，导致无法进入topk的结果集；
// 调整 nlist 和 nprobe 参数也无法解决，修改索引类型也无效；
const r = await vectorStore.client.search({
  collection_name: COLLECTION_NAME,
  data: v,
  // params: { nprobe: 16 }, // IVF 时 nprobe 参数有效；
  limit: 2,
});

// ----------  文本匹配  ------------
// 必须是精确匹配，否则无法匹配到结果
const r1 = await vectorStore.client.query({
  collection_name: COLLECTION_NAME,
  filter: "PHRASE_MATCH(text, '价保', 0)", // TEXT_MATCH
  output_fields: ["text"],
});

// -----------  全文检索  ------------
// 基于 BM25、稀疏向量检索
const r2 = await vectorStore.client.search({
  collection_name: COLLECTION_NAME,
  data: ["价保多久？"],
  anns_field: "sparse_vector",
  output_fields: ["text"],
  limit: 2,
});

// -----------  混合检索  ------------
// 混合检索方式，通过语义和关键字匹配相关的文档片段；
// https://milvus.io/docs/zh/multi-vector-search.md
const res = await vectorStore.client.hybridSearch({
  collection_name: COLLECTION_NAME,
  data: [
    {
      data: v,
      anns_field: "dense_vector",
      limit: 3,
    },
    {
      data: "价保多久？",
      anns_field: "sparse_vector",
      limit: 3,
    },
  ],
  rerank: {
    type: FunctionType.RERANK,
    name: "rrf",
    strategy: "rrf",
    params: {
      reranker: "rrf",
      k: 60,
    },
  },
  output_fields: ["text"],
  limit: 3,
});

console.log(res);
