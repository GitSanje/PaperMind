"use server";
import pdfParse from "pdf-parse";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import {
  ChatGoogleGenerativeAI,
  GoogleGenerativeAIEmbeddings,
} from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { pull } from "langchain/hub";
import { Annotation, StateGraph } from "@langchain/langgraph";
import { Document } from "langchain/document";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import * as jschardet from "jschardet";
// Load and index documents from a URL
async function loadRag(url?: string, file?: File) {
  try {
    if (!file || !url) {
      return null;
    }
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 50,
    });
    let docSplits;
    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());

      let text = "";

      if (file.type === "application/pdf") {
        const pdfData = await pdfParse(buffer);
        text = pdfData.text;
      } else if (
        file.type.startsWith("text/") ||
        file.name.endsWith(".txt") ||
        file.name.endsWith(".csv")
      ) {
        const detected = jschardet.detect(buffer);
        const encoding = (detected.encoding || "utf-8").toLowerCase();
        const validEncoding: BufferEncoding = [
          "utf8",
          "ascii",
          "base64",
          "hex",
          "latin1",
          "ucs2",
          "utf16le",
        ].includes(encoding)
          ? (encoding as BufferEncoding)
          : "utf8";
        text = buffer.toString(validEncoding);
      } else {
        return null;
      }
      docSplits = await splitter.createDocuments([text]);
    } else {
      const loader = new CheerioWebBaseLoader(url);
      const rawDocs = await loader.load();
      docSplits = await splitter.splitDocuments(rawDocs);
    }
   
    const embeddings = new GoogleGenerativeAIEmbeddings({
      model: "gemini-embedding-exp-03-07",
      taskType: TaskType.RETRIEVAL_DOCUMENT,
      title: "Document title",
      apiKey: process.env.GOOGLE_API_KEY,
    });
    const vectorStore = new MemoryVectorStore(embeddings);
    // const vectorStorefaiss = new FaissStore(embeddings, {});
    await vectorStore.addDocuments(docSplits);

    return vectorStore;
  } catch (error) {
    console.error("loadRag error:", error);
    return null;
  }
}

// Generate answer from loaded docs and user query
export async function genText(formData: FormData) {
  const file = formData.get("file") as File;
  const query = formData.get("query") as string;
  const url = formData.get("url") as string;

  const vectorStore = await loadRag(url, file);

  if (!vectorStore) {
    return "❌ Failed to load or index documents.";
  }

  const llm = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    temperature: 0,
    apiKey: process.env.GOOGLE_API_KEY,
  });

  const promptTemplate = await pull<ChatPromptTemplate>("rlm/rag-prompt");

  // Define application states
  const InputStateAnnotation = Annotation.Root({
    question: Annotation<string>(),
  });

  const StateAnnotation = Annotation.Root({
    question: Annotation<string>(),
    context: Annotation<Document[]>(),
    answer: Annotation<string>(),
  });

  // Step 1: Retrieve relevant documents
  const retrieve = async (state: typeof InputStateAnnotation.State) => {
    const retrievedDocs = await vectorStore?.similaritySearch(
      state.question,
      4
    );
    return { context: retrievedDocs };
  };

  // Step 2: Generate answer from context
  const generate = async (state: typeof StateAnnotation.State) => {
    const docsContent = (state.context || [])
      .map((doc) => doc.pageContent)
      .join("\n");

    const messages = await promptTemplate.invoke({
      question: state.question,
      context: docsContent,
    });

    const response = await llm.invoke(messages);
    return { answer: response.content };
  };

  // Compile and run graph
  const graph = new StateGraph(StateAnnotation)
    .addNode("retrieve", retrieve)
    .addNode("generate", generate)
    .addEdge("__start__", "retrieve")
    .addEdge("retrieve", "generate")
    .addEdge("generate", "__end__")
    .compile();

  const result = await graph.invoke({ question: query });

  return result.answer;
}
