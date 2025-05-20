"use client";
import React, { useEffect, useState } from "react";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { Document } from "langchain/document";

interface Props {
  url: string;
}

const Rag = ({ url }: Props) => {
  const [docs, setDocs] = useState<Document[]>([]);

  useEffect(() => {
    const loaddocs = async () => {
      try {
        // Load documents from the web
        const loadedDocsArrays = await Promise.all(
          [url].map((u) => new CheerioWebBaseLoader(u).load())
        );
        const loadedDocs = loadedDocsArrays.flat();

        // Split documents into chunks
        const textSplitter = new RecursiveCharacterTextSplitter({
          chunkSize: 500,
          chunkOverlap: 50,
        });
        const docSplits = await textSplitter.splitDocuments(loadedDocs);

        // Create embeddings
        const embeddings = new GoogleGenerativeAIEmbeddings({
          model: "gemini-embedding-exp-03-07",
          taskType: TaskType.RETRIEVAL_DOCUMENT,
          title: "Document title",
        });

        // Store in memory vector DB
        const vectorStore = await MemoryVectorStore.fromDocuments(
          docSplits,
          embeddings
        );

        setDocs(docSplits);
        console.log("Documents loaded and embedded successfully");
      } catch (err) {
        console.error("Error loading documents:", err);
      }
    };

    if (url) loaddocs();
  }, [url]);

  return (
    <div>
      <h2>Loaded {docs.length} document chunks.</h2>
    </div>
  );
};

export default Rag;
