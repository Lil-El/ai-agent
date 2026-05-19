import "dotenv/config";
import { existsSync, readFileSync, readdirSync } from "fs";
import { join } from "path";
import { MilvusClient, DataType, IndexType, MetricType } from "@zilliz/milvus2-sdk-node";
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
      await client.dropCollection({ collection_name: COLLECTION_NAME });
    }

    const vectors = await embeddings.embedDocuments(chunks.map((c) => c.pageContent));

    const dim = vectors[0].length;

    await client.createCollection({
      collection_name: COLLECTION_NAME,
      fields: [
        {
          name: "langchain_primaryid",
          data_type: DataType.Int64,
          is_primary_key: true,
          autoID: true,
        },
        { name: "langchain_vector", data_type: DataType.FloatVector, dim },
        { name: "langchain_text", data_type: DataType.VarChar, max_length: 8000 },
        { name: "source", data_type: DataType.VarChar, max_length: 256 },
      ],
    });

    await client.createIndex({
      collection_name: COLLECTION_NAME,
      field_name: "langchain_vector",
      index_type: IndexType.IVF_FLAT,
      metric_type: MetricType.L2,
      params: { nlist: 1024 },
    });

    await client.loadCollection({ collection_name: COLLECTION_NAME });

    const data = chunks.map((chunk, i) => ({
      langchain_text: chunk.pageContent,
      langchain_vector: vectors[i],
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
