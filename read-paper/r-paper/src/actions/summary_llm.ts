"use server"
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import { Blob as NodeBlob } from "buffer";
import {  createChunksPreservingId, get_chunks_with_ids, get_combined_prompt, get_splitter, LabeledChunks, PageDict, tokenizer } from "./utils";



 const url = "https://arxiv.org/pdf/1806.07572";


const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  temperature: 0,
  apiKey: process.env.GOOGLE_API_KEY,
});


export async function get_chunks(
  text: string,
  tokenizer: any,
  chunk_size: number,
  chunk_overlap: number
): Promise<string[]> {
  const splitter = get_splitter(tokenizer, chunk_size, chunk_overlap);
  const chunks = await splitter.splitText(text);
  return chunks;
}
async function getTextFromPDF(filePath?: string, url?: string) {
  let docs;
  // const __filename = fileURLToPath(import.meta.url);
  //   const __dirname = path.dirname(__filename);
  //   const fullpath = path.resolve(__dirname, "public",filePath!);
    const fullpath = path.join( "public",filePath!);

  if (fs.existsSync(fullpath)) {
    
    const loader = new PDFLoader(fullpath!);
    docs = await loader.load();
  } else {
    const response = await axios.get(url!, { responseType: "arraybuffer" });
    const blob = new NodeBlob([response.data], { type: "application/pdf" });
    const loader = new PDFLoader(blob as Blob, { splitPages: true });
    docs = await loader.load();
  }

  const pages_dict: PageDict = {};
  const pages_list: string[] = [];

  docs.forEach((page, index) => {
    pages_dict[index] = [page.pageContent];
    pages_list.push(page.pageContent);
  });

  return { pages_dict, pages_list };
}


async function getGemini(promptTemplateStr: string, text: string) {
  // Step 1: Create prompt template
  const prompt = PromptTemplate.fromTemplate(promptTemplateStr);

  // Step 2: Create chain
  const chain = prompt.pipe(llm);

  // Step 3: Run the chain with the input text
  const response = chain.invoke({ text });

  return (await response).content;
}

async function getSummaryByChunk(
  labeledChunks: LabeledChunks
): Promise<Record<number, string>> {
  const summaryEntries = await Promise.all(
    Object.entries(labeledChunks).map(async ([indexStr, chunk]) => {
      const index = Number(indexStr);
      const passageText = chunk.passages.join("");
      const promptTemplate = get_combined_prompt(null);
      const summary = await getGemini(promptTemplate, passageText);
      console.log(`Generating summary for chunk ${index}`);
      return [index, summary as string] as [number, string];
    })
  );

  return Object.fromEntries(summaryEntries);
}


async function getAllsummary(summaries_chunk: Record<number, string>) {
  const allPassages: string[] = [];

  for (const chunk of Object.values(summaries_chunk)) {
    allPassages.push(chunk);
  }
  const PromptTemplate = get_combined_prompt(null);
  const allsummary = await getGemini(PromptTemplate, allPassages.join(""));
  return allsummary as string;
  
}
export async function getSummary(formdata: FormData) {
  const filename = formdata.get("filename") as string;
  const url = formdata.get("url") as string;
  const result = await getTextFromPDF(filename, url);

  const allText = result.pages_list.join("");
 const cleanedSentences = get_chunks_with_ids(allText) 
  const chunkswitlables = createChunksPreservingId(cleanedSentences,tokenizer, 2500,50)

  const summaries_chunk = await getSummaryByChunk(chunkswitlables);
  const allsummary = await getAllsummary(summaries_chunk);
  return { chunkswitlables, allsummary };
}

