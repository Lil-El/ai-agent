import "dotenv/config";
import { Annotation, START, END, StateGraph } from "@langchain/langgraph";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { Milvus } from "@langchain/community/vectorstores/milvus";

const COLLECTION_NAME = "rag_docs";

const embeddings = new OpenAIEmbeddings({
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.EMBEDDINGS_MODEL_NAME,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL,
  },
});

const llm = new ChatOpenAI({
  model: process.env.MODEL_NAME,
  temperature: 0,
  apiKey: process.env.OPENAI_API_KEY,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL,
  },
});

const vectorStore = await Milvus.fromExistingCollection(embeddings, {
  collectionName: COLLECTION_NAME,
  url: "http://127.0.0.1:19530",
});

const retriever = vectorStore.asRetriever({ k: 4 });

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "你是客服助手。仅根据下面「上下文」回答；上下文没有的信息请明确说不知道，不要编造。\n\n上下文：\n{context}",
  ],
  ["human", "{question}"],
]);

const chain = RunnableSequence.from([prompt, llm, new StringOutputParser()]);

const GraphState = Annotation.Root({
  question: Annotation,
  context: Annotation,
  answer: Annotation,
});

async function retrieve(state) {
  const docs = await retriever.invoke(state.question);
  // console.log(docs);
  return { context: docs };
}

async function generate(state) {
  const contextText = state.context.map((doc) => doc.pageContent).join("\n");
  const answer = await chain.invoke({
    context: contextText,
    question: state.question,
  });

  return { answer };
}

const workflow = new StateGraph(GraphState)
  .addNode("retrieve", retrieve)
  .addNode("generate", generate)
  .addEdge(START, "retrieve")
  .addEdge("retrieve", "generate")
  .addEdge("generate", END);

export const ragAgent = workflow.compile();

export async function ask(question) {
  const result = await ragAgent.invoke({ question });
  return {
    answer: result.answer,
    context: result.context ?? [],
  };
}
