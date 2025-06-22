"use server";
import pdfParse from "pdf-parse";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

import {
  ChatGoogleGenerativeAI,
  GoogleGenerativeAIEmbeddings,
} from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { Blob as NodeBlob } from "buffer";
import { Checkpoint, InMemoryStore, MemorySaver } from "@langchain/langgraph";
import {
  Annotation,
  StateGraph,
  MessagesAnnotation,
} from "@langchain/langgraph";
import { Document } from "langchain/document";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import * as jschardet from "jschardet";
import axios from "axios";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
  ToolMessage,
  BaseMessage,
} from "@langchain/core/messages";

import { z } from "zod";
import { tool } from "@langchain/core/tools";
const retrieveSchema = z.object({ query: z.string() });
import { ToolNode, toolsCondition } from "@langchain/langgraph/prebuilt";
import { Redis } from "ioredis";
import { RedisByteStore } from "@langchain/community/storage/ioredis";
import { BufferMemory } from "langchain/memory";
import { RedisChatMessageHistory } from "@langchain/community/stores/message/ioredis";
import { RedisSaver } from "@/lib/redis-checkpointer";
import { load } from "@langchain/core/load";

// Load and index documents from a URL
async function loadRag(url?: string, file?: File) {
  try {
    if (!file && !url) {
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
      const response = await axios.get(url!, { responseType: "arraybuffer" });
      const blob = new NodeBlob([response.data], { type: "application/pdf" });
      const loader = new PDFLoader(blob as Blob, { splitPages: true });
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

//  const store = new RedisByteStore({ client: new Redis("redis://localhost:6379") });
const client = new Redis({
  host: "localhost",
  port: 6379,
  db: 0 // default DB index
});
client.on("error", (err) => {
  console.error("Redis Client Error", err);
});


// const inMemoryStore = new InMemoryStore();
// const checkpointer = new MemorySaver();

// const memory = new BufferMemory({
//   chatHistory: new RedisChatMessageHistory({
//     sessionId: new Date().toISOString(),
//     sessionTTL: 300,
//     client,
//   }),
// });
const redisCheckpointer = new RedisSaver(client);

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

  // Conditional route
  // const toolsCondition = (state: any) => {
  //   const lastMessage = state.messages[state.messages.length - 1];
  //   return lastMessage?.tool_calls?.length > 0 ? "tools" : "__end__";
  // };
  const toolsCondition = (state: any) => {
    const lastMessage = state.messages[state.messages.length - 1];
    if (lastMessage?.tool_calls?.length > 0) return "tools";
    if (lastMessage?.content) return "__end__"; // direct answer, skip tools
    return "tools"; // fallback to tool path
  };

  const retrieve = tool(
    async ({ query }) => {
      const retrievedDocs = await vectorStore.similaritySearch(query, 2);
      const serialized = retrievedDocs
        .map(
          (doc) => `Source: ${doc.metadata.source}\nContent: ${doc.pageContent}`
        )
        .join("\n");
      return [serialized, retrievedDocs];
    },
    {
      name: "retrieve",
      description: "Retrieve information related to a query.",
      schema: retrieveSchema,
      responseFormat: "content_and_artifact",
    }
  );

  // Step 1: Generate an AIMessage that may include a tool-call to be sent.
  async function queryOrRespond(state: typeof MessagesAnnotation.State) {
    const llmWithTools = llm.bindTools([retrieve]);
    const messages = [...state.messages];
    if (!messages.some(m => m instanceof SystemMessage )) {
        messages.unshift(new SystemMessage(
            "You are a helpful assistant. For any question requiring external information or knowledge beyond your general training data, you **must** use the 'retrieve' tool. Only answer directly if the question is common knowledge or doesn't require external lookup."
        ));
    }
    console.log('====================================');
    console.log(messages);
    console.log('====================================');
    const response = await llmWithTools.invoke(state.messages);
    // MessagesState appends messages to state instead of overwriting
    return { messages: [response] };
  }
  // Step 2: Execute the retrieval.
  const tools = new ToolNode([retrieve]);

  const filterMessages = (messages: BaseMessage[]): BaseMessage[] => {
    // This is very simple helper function which only ever uses the last message
    return messages.slice(-1);
  };

  // Step 3: Generate a response using the retrieved content.
  async function generate(state: typeof MessagesAnnotation.State) {
 
    // Get generated ToolMessages
    let recentToolMessages = [];
    for (let i = state["messages"].length - 1; i >= 0; i--) {
      let message = state["messages"][i];
      if (message instanceof ToolMessage) {
        recentToolMessages.push(message);
      } else {
        break;
      }
    }

    let toolMessages = recentToolMessages.reverse();
    // Format into prompt
    const docsContent = toolMessages.map((doc) => doc.content).join("\n");
    const systemMessageContent = `
          You are a helpful and knowledgeable assistant for question-answering tasks.

          You have access to external retrieved context (shown below) as well as your own general knowledge.

          Use the provided context to guide and inform your answers. If the context is unclear or does not contain the answer, rely on your own understanding — but always make it clear if you're answering based on prior knowledge rather than the given context.

          Retrieved context:
          -------------------
          ${docsContent}
          -------------------
          `;

    const conversationMessages = state.messages.filter(
      (message) =>
        message instanceof HumanMessage ||
        message instanceof SystemMessage ||
        (message instanceof AIMessage && message.tool_calls?.length == 0)
    );

    const prompt = [
      new SystemMessage(systemMessageContent),
      ...conversationMessages,
    ];

    const prompt2 = filterMessages(state.messages);
   

    // Run
    const response = await llm.invoke(prompt);
    return { messages: [response] };
  }
  // Compile and run graph

  const graphBuilder = new StateGraph(MessagesAnnotation)
    .addNode("queryOrRespond", queryOrRespond)
    .addNode("tools", tools)
    .addNode("generate", generate)
    .addEdge("__start__", "queryOrRespond")
    .addConditionalEdges("queryOrRespond", toolsCondition, {
      __end__: "__end__",
      tools: "tools",
    })

    .addEdge("tools", "generate")
    .addEdge("generate", "__end__");

  const graphWithMemory = graphBuilder.compile({
    checkpointer: redisCheckpointer,
  });
  // Specify an ID for the thread
  const threadConfig = {
    configurable: { thread_id: "123abc" },
    streamMode: "values" as const,
  };

  // const userId = "1";
  // const namespaceForMemory = [userId, "memories"];
  // const memoryId = uuid4();
  // Fetch all memory items
  // const allMemory = await inMemoryStore.search(namespaceForMemory);
  // const relevantMemories = allMemory.slice(-3);
  // // Format memory into string context
  // const memoryContext = relevantMemories
  //   .map((mem: any) => `Q: ${mem.value.question}\nA: ${mem.value.answer}`)
  //   .join("\n");

  // // Create a system message to inject memory context
  // const memoryMessage = new SystemMessage(
  //   "Relevant past conversations:\n" + memoryContext
  // );

  const result = await graphWithMemory.invoke(
    {
      messages: [new HumanMessage(query)],
    },
    threadConfig
  );
  const state = await graphWithMemory.getState(threadConfig);

  console.log("====================================");
  console.log("state", state);
  console.log("====================================");

  const finalAnswer =
    result.messages.findLast((m) => m instanceof AIMessage)?.content || "";
  // const memory = {
  //   question: query,
  //   answer: finalAnswer,
  //   timestamp: new Date().toISOString(),
  // };
  // await inMemoryStore.put(namespaceForMemory, memoryId, memory);

  return finalAnswer;
}
export const getMessageHistory = async (thread_id: string) => {
  const allMessages: Array<{ role: "user" | "ai"; content: string }> = [];
  const seen = new Set<string>();

  const zsetKey = `checkpoints:${thread_id}`;
  const allCheckpointIds = await client.zrevrange(zsetKey, 0, -1);
  console.log('====================================');
  console.log(allCheckpointIds);
  console.log('====================================');
  for (const checkpoint_id of allCheckpointIds) {
    const key = `checkpoint:${thread_id}:${checkpoint_id}`;
    const data = await client.hgetall(key);
    if (!data?.checkpoint || !data?.metadata) continue;

    const checkpoint = await load<Checkpoint>(data.checkpoint);
    const channelValues = checkpoint.channel_values;

    if (channelValues?.messages && Array.isArray(channelValues.messages)) {
      const messages = channelValues.messages.map((message) => {
        if (message instanceof HumanMessage)
          return { role: "user", content: message.content };
        if (
          message instanceof AIMessage &&
          typeof message.content === "string"
        )
          return { role: "ai", content: message.content };
        return null;
      }).filter(Boolean) as Array<{ role: "user" | "ai"; content: string }>;

      for (const msg of messages) {
        const key = `${msg.role}-${msg.content}`;
        if (!seen.has(key)) {
          seen.add(key);
          allMessages.push(msg);
        }
      }
    }
  }

  return allMessages;
};


export const clearAll = async (thread_id: string) => {
  try {
    const zsetKey = `checkpoints:${thread_id}`;

    // Get all checkpoint IDs for the thread
    const allCheckpointIds = await client.zrevrange(zsetKey, 0, -1);

    // Loop through and delete each checkpoint and associated writes
    for (const checkpoint_id of allCheckpointIds) {
      // Delete writes
      const writeKeys = await client.keys(
        `checkpoint:${thread_id}:${checkpoint_id}:writes:*`
      );
      if (writeKeys.length > 0) {
        await client.del(...writeKeys);
      }

      // Delete the checkpoint hash
      await client.del(`checkpoint:${thread_id}:${checkpoint_id}`);

      // Remove the checkpoint from the sorted set
      await client.zrem(zsetKey, checkpoint_id);
    }

    return {
      status: true,
      message: "Successfully cleared!",
    };
  } catch (error) {
    console.log(error);

    return {
      status: false,
      message: "Error clearing messages!",
    };
  }
};
