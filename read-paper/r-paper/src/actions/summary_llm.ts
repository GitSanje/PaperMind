"use server"
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import fs from "fs";
import path from "path";
import axios from "axios";
import { Blob as NodeBlob } from "buffer";
import {  createChunksPreservingId, get_chunks_with_ids, get_combined_prompt, get_splitter, LabeledChunks, PageDict, tokenizer } from "./utils";



 const url = "https://arxiv.org/pdf/1806.07572";


 const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  temperature: 0,
  apiKey: process.env.GOOGLE_API_KEY,
});
/**
 * Split text into chunks using a tokenizer with specified chunk size and overlap.
 * 
 * @param {string} text - The input text to chunk.
 * @param {any} tokenizer - Tokenizer object with encoding method.
 * @param {number} chunk_size - Maximum tokens per chunk.
 * @param {number} chunk_overlap - Number of overlapping tokens between chunks.
 * @returns {Promise<string[]>} - Array of text chunks.
 */
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

/**
 * Extract text content from a PDF either from a local file or a remote URL.
 * Returns a dictionary and list of pages with their text content.
 * 
 * @param {string} [filePath] - Local path to PDF file.
 * @param {string} [url] - Remote URL of the PDF file.
 * @returns {Promise<{pages_dict: PageDict, pages_list: string[]}>} - Extracted text organized by page.
 */
export async function getTextFromPDF(filePath?: string, url?: string) {
  let docs;

   if(url){
      // Download PDF from URL and load
    const response = await axios.get(url!, { responseType: "arraybuffer" });
    const blob = new NodeBlob([response.data], { type: "application/pdf" });
    const loader = new PDFLoader(blob as Blob, { splitPages: true });
    docs = await loader.load();
   }
  else if (fs.existsSync( path.join("public", filePath!))) {
    // Load PDF from local file
     const fullpath=  path.join("public", filePath!);
    const loader = new PDFLoader(fullpath!);
    docs = await loader.load();
  } 

  const pages_dict: PageDict = {};
  const pages_list: string[] = [];

  // Collect page text contents
  docs?.forEach((page, index) => {
    pages_dict[index] = [page.pageContent];
    pages_list.push(page.pageContent);
  });

  return { pages_dict, pages_list };
}

/**
 * Runs a prompt template with input text through the Gemini model chain and returns the generated response.
 * 
 * @param {string} promptTemplateStr - Prompt template string.
 * @param {string} text - Input text for the model.
 * @returns {Promise<string>} - Generated content from the model.
 */
export async function getGemini(promptTemplateStr: string, text: string) {
  const prompt = PromptTemplate.fromTemplate(promptTemplateStr);
  const chain = prompt.pipe(llm);
  const response = chain.invoke({ text });
  return (await response).content;
}

/**
 * Generate summaries for each chunk in labeledChunks by running them through the Gemini model.
 * 
 * @param {LabeledChunks} labeledChunks - Object containing chunks of text to summarize.
 * @returns {Promise<Record<number, string>>} - Map of chunk index to its summary.
 */
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

/**
 * Aggregate multiple chunk summaries into a single combined summary.
 * 
 * @param {Record<number, string>} summaries_chunk - Map of chunk summaries.
 * @returns {Promise<string>} - Combined summary string.
 */
async function getAllsummary(summaries_chunk: Record<number, string>) {
  const allPassages: string[] = [];

  for (const chunk of Object.values(summaries_chunk)) {
    allPassages.push(chunk);
  }

  const PromptTemplate = get_combined_prompt(null);
  const allsummary = await getGemini(PromptTemplate, allPassages.join(""));
  return allsummary as string;
}

/**
 * Main function to process PDF, chunk its text, generate summaries for each chunk, 
 * and then combine all summaries into one.
 * 
 * @param {FormData} formdata - Form data containing 'filename' and 'url' fields.
 * @returns {Promise<{chunkswitlables: LabeledChunks, allsummary: string}>} - Chunked text with labels and combined summary.
 */
export async function getSummary(formdata: FormData) {
  const filename = formdata.get("filename") as string;
  const url = formdata.get("url") as string;

  // Extract text pages from PDF file or URL
  const result = await getTextFromPDF(filename, url);
  const allText = result.pages_list.join("");

  // Split text into sentences with IDs
  const cleanedSentences = get_chunks_with_ids(allText);

  // Create token-based chunks preserving sentence IDs
  const chunkswitlables = createChunksPreservingId(cleanedSentences, tokenizer, 2500, 50);

  // Generate summaries for each chunk
  const summaries_chunk = await getSummaryByChunk(chunkswitlables);

  // Combine all chunk summaries into one summary
  const allsummary = await getAllsummary(summaries_chunk);

  return { chunkswitlables, allsummary };
}

const prompt = `
Given the first page of a scientific or academic PDF document, extract a clean and concise title.
If a clear title is not present, infer one based on the content.
Return only the title string and nothing else.
 {text}
`;

export async function getPdfTitle(formdata: FormData){
   const filename = formdata.get("filename") as string;
  const url = formdata.get("url") as string;

  // Extract text pages from PDF file or URL
  const result = await getTextFromPDF(filename, url);
  
 const res = await getGemini(prompt, result.pages_list[0]) as string;
 return {
    title: res.trim() || "Untitled Document",
  };


}