import "dotenv/config";
import { existsSync, readFileSync, readdirSync } from "fs";
import { join } from "path";
import { MilvusClient, DataType, IndexType, MetricType, FunctionType } from "@zilliz/milvus2-sdk-node";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";

const COLLECTION_NAME = "rag_docs";

const embeddings = new OpenAIEmbeddings({
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.EMBEDDINGS_MODEL_NAME,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL,
  },
});

const client = new MilvusClient({ address: "localhost:19530" });

async function loadChunks(dataDir = "./data") {
  if (!existsSync(dataDir)) {
    throw new Error(`${dataDir} does not exist`);
  }

  const files = readdirSync(dataDir).filter((f) => /\.(txt|md)$/i.test(f));

  if (files.length === 0) {
    throw new Error(`${dataDir} does not contain any files`);
  }

  const docs = files.map((f) => ({
    pageContent: readFileSync(join(dataDir, f), "utf8"),
    metadata: { source: f },
  }));

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
  });

  return splitter.splitDocuments(docs);
}

async function main() {
  try {
    await client.connectPromise;

    const chunks = await loadChunks();

    const hasCollection = await client.hasCollection({ collection_name: COLLECTION_NAME });

    if (hasCollection.value) {
      // 先释放集合
      await client.releaseCollection({ collection_name: COLLECTION_NAME });
      // 删除旧集合
      await client.dropCollection({ collection_name: COLLECTION_NAME });
    }

    const vectors = await embeddings.embedDocuments(chunks.map((c) => c.pageContent));

    const dim = vectors[0].length;

    console.log("Collection dropped successfully.");

    await client.createCollection({
      collection_name: COLLECTION_NAME,
      fields: [
        {
          name: "langchain_primaryid",
          data_type: DataType.Int64,
          is_primary_key: true,
          autoID: true,
        },
        {
          name: "text",
          data_type: DataType.VarChar,
          max_length: 8000,
          // 启用文本匹配：PHRASE_MATCH(text, '价保') | TEXT_MATCH(text, '价保')
          enable_match: true,
          enable_analyzer: true,
          // 文本匹配分析器设置。https://milvus.io/docs/zh/analyzer-overview.md
          analyzer_params: { type: "chinese" },
        },
        { name: "dense_vector", data_type: DataType.FloatVector, dim },
        { name: "sparse_vector", data_type: DataType.SparseFloatVector },
        { name: "source", data_type: DataType.VarChar, max_length: 256 },
      ],
      index_params: [
        {
          collection_name: COLLECTION_NAME,
          field_name: "dense_vector",
          index_name: "text_dense_index",
          index_type: IndexType.FLAT,
          metric_type: MetricType.L2,
          params: {},
        },
        {
          collection_name: COLLECTION_NAME,
          field_name: "sparse_vector",
          index_name: "text_sparse_index",
          index_type: IndexType.SPARSE_INVERTED_INDEX,
          metric_type: MetricType.BM25,
          params: {
            inverted_index_algo: "DAAT_MAXSCORE",
          },
        },
      ],
      functions: [
        {
          name: "text_bm25_emb",
          description: "bm25 function",
          type: FunctionType.BM25,
          input_field_names: ["text"],
          output_field_names: ["sparse_vector"],
          params: {},
        },
      ],
    });

    console.log("Collection created successfully.");

    // await client.createIndex([]);

    await client.loadCollection({ collection_name: COLLECTION_NAME });

    const data = chunks.map((chunk, i) => ({
      text: chunk.pageContent,
      dense_vector: vectors[i],
      source: chunk.metadata.source,
    }));

    const result = await client.insert({
      collection_name: COLLECTION_NAME,
      data,
    });
  } catch (error) {
    console.error("Error:", error.message);
  }
}

main();
