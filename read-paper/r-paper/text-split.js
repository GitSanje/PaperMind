
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import {
  ChatGoogleGenerativeAI,

} from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";


import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import { Blob as NodeBlob } from "buffer";
import { fromPreTrained } from "@lenml/tokenizer-gemini";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.resolve(__dirname, "public", "ntk.pdf");
const url = "https://arxiv.org/pdf/1806.07572";

async function getTextFromPDF(filePath, url) {
  let docs;
  if (fs.existsSync(filePath)) {
    const loader = new PDFLoader(filePath);
    docs = await loader.load();
  } else {
     const response = await axios.get(url, { responseType: "arraybuffer" });
     const blob = new NodeBlob([response.data], { type: "application/pdf" });
    const loader = new PDFLoader(blob, { splitPages: true }); 
    docs = await loader.load();
  }

  const pages_dict = {};
  const pages_list = [];

  docs.forEach((page, index) => {
    pages_dict[index] = page.pageContent;
    pages_list.push(page.pageContent);
  });

  return { pages_dict, pages_list };
}

function cleanArxivText(text) {
  // Remove inline LaTeX math like $...$
  text = text.replace(/\$.*?\$/g, '');

  // Remove LaTeX environments like \begin{...} and \end{...}
  text = text.replace(/\\(begin|end)\{.*?\}/g, '');

  // Remove URLs and mentions
  text = text.replace(/http\S+|www\S+|@\S+/g, '');

  // Remove LaTeX commands like \command or \command[opt]{arg}
  text = text.replace(/\\[a-zA-Z]+(\[[^\]]*\])?(\{[^\}]*\})?/g, '');

  // Remove LaTeX-style citations or malformed refs like ( * ? )
  text = text.replace(/\(\s*\*?\s*\?\s*\)/g, '');

  // Remove lone question marks or surrounded by punctuation
  text = text.replace(/["',]*\?+["',]*/g, '');

  // Remove multiple quotes/commas
  text = text.replace(/["',]{2,}/g, '');

  // Remove spaces before multiple dots
  text = text.replace(/\s\.{2,}/g, ' ');

  // Remove multiple dots, keep only one
  text = text.replace(/\.(?=.*\.)/g, ' ');

  // Remove digits followed by dot (e.g., 1. 2. etc.)
  text = text.replace(/\d\./g, ' ');

 // Remove References/Bibliography section
   const referencesPattern = /(References|Bibliography|References\s?and\s?Acknowledgements).*?(?=\n\n[A-Z][a-z]+\s.*|$)/gs;
  text = text.replace(referencesPattern, '');

  // Collapse multiple spaces
  return text.replace(/\s+/g, ' ').trim();
}


const result = await getTextFromPDF(null,url);

const allText = result.pages_list.join('');

// const embeddings = new GoogleGenerativeAIEmbeddings({
//       model: "gemini-embedding-exp-03-07",
//       taskType: TaskType.RETRIEVAL_DOCUMENT,
//       title: "Document title",
//       apiKey: process.env.GOOGLE_API_KEY,
//     });
const tokenizer = fromPreTrained();

const text = result.pages_dict[0]

function get_splitter(tokenizer, chunk_size,chunk_overlap){
    const token_length = (text) => tokenizer.encode(text).length
    const splitter = new RecursiveCharacterTextSplitter({
         chunkSize: chunk_size, chunkOverlap: chunk_overlap, lengthFunction: token_length 
     });
  return splitter

}

async function get_chunks(text,tokenizer,chunk_size,chunk_overlap){
    const splitter = get_splitter(tokenizer,chunk_size,chunk_overlap)
    const chunks = await splitter.splitText(text)
    return chunks
}


function chunkByTokens(tokenizer, text, maxTokens = 2000, buffer = 50) {
  const cleanedText = cleanArxivText(text); 
  const sentences = cleanedText.trim().split(/(?<=[.!?])\s+/);
  return createChunks(tokenizer, sentences, maxTokens, buffer);
}

function createChunks(tokenizer, texts, maxTokens, buffer) {
  const chunks = [];
  let currentChunk = [];
  let currentTokens = 0;

  for (const sentence of texts) {
    const tokenCount = tokenizer.encode(sentence).length;

    if (currentTokens + tokenCount > maxTokens - buffer) {
      if (currentChunk.length > 0) {
        chunks.push([...currentChunk]);
      }
      currentChunk = [sentence];
      currentTokens = tokenCount;
    } else {
      currentChunk.push(sentence);
      currentTokens += tokenCount;
    }
  }

  if (currentChunk.length > 0) {
    chunks.push([...currentChunk]);
  }

  return chunks;
}



const chunks =  chunkByTokens(tokenizer,allText,2500,50)



function assignLabel(corpus, prevChunkSize = 0) {
  return corpus.map((sentence, i) => {
    const index = i + prevChunkSize;
    return `${sentence.trim()} [${index}]\n`;
  });
}

function assignLabelAll(chunks) {
  const passageLabels = {};
 

  let prevChunkEnd = 0;

  let i =0
  for (const chunk of chunks) {
    const chunkLen = chunk.length;

    passageLabels[i] = {
      passages: assignLabel(chunk, prevChunkEnd),
      info: [chunkLen, prevChunkEnd]
    };

    prevChunkEnd += chunkLen;
    i+=1;
  }
return passageLabels

}

const labeledchunks = assignLabelAll(chunks)


function get_combined_prompt(text){

    const combined_prompt = `
        <|system|>
            You are a helpful assistant that generates fluent, concise, and meaningful abstractive summaries. Your output should reflect true understanding, avoid redundancy, and provide accurate traceability to the original text.

        <|user|>
           Write an abstractive summary that conveys all essential points from the input in a coherent and well-structured manner. Ensure that:
        - ⚠️ Do **not** include reference labels unless you're confident about the source. Avoid default or sequential numbering (e.g., [1], [2], [3]) unless it truly corresponds to the original source. Do not include Note section.
        - ✂️ Disregard irrelevant paragraphs — only include information that contributes meaningfully to the core message.
        - 🧠 Reorganize the content where helpful to improve clarity and logical flow.
        - ✍️ Maintain a natural, readable tone throughout.
        - ➗ If mathematical formulas or concepts are involved, use LaTeX formatting for clarity.
        - Do **not** repeat sentences from the input or simply rephrase them mechanically — instead, paraphrase and condense the ideas clearly, removing unnecessary or redundant details.
        - If appropriate, feel free to use:
        • **Bullet points or numbered lists** for clarity.
        • **Mathematical notation in LaTeX** for formulas or equations.
        • **Tables** to organize structured information.

        Each sentence in the input is annotated with a label like [n]. Use these for traceability in your output.

        Avoid including extra words like “summary” or “document” — just provide the final composed summary.

        Input format:
        <sentence>. [n] <next sentence>. [m]

        Text:
        ${text ? {text}: '{text}'}

        <|assistant|>
        `
    return combined_prompt

    
}


const GOOGLE_API_KEY="AIzaSyDEckSvtc3k_d0KgXyPgsvC1nUUjYc7xBk"


 const llm = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    temperature: 0,
    apiKey: GOOGLE_API_KEY,
  });

async function getGemini(promptTemplateStr, text) {
    // Step 1: Create prompt template
    const prompt = PromptTemplate.fromTemplate(promptTemplateStr);

    // Step 2: Create chain
    const chain = prompt.pipe(llm);

    // Step 3: Run the chain with the input text
    const response =  chain.invoke({text})

  return response;
}
export function retrievePassageByCiteId(
  labeledChunks,
  id
) {
  for (const [key,chunk ]of Object.entries(labeledChunks)) {
    const start = chunk.info[1];
    const end = chunk.info[0] + chunk.info[1];
    if (id >= start && id < end) {
      const index = id - start
     return [chunk.passages[index], key,chunk.char_range[index]];
    }
  }
  return undefined; 
}

function get_chunks_with_ids(text) {
  const referencesPattern = /(References|Bibliography|References\s?and\s?Acknowledgements).*?(?=\n\n[A-Z][a-z]+\s.*|$)/gs;
  const allText = text.replace(referencesPattern, '');
  const originalSentences = [];

  let currentIndex = 0;
  const sentences = allText.trim().split(/(?<=[.!?])\s+/);

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    const start = currentIndex;
    const end = start + trimmed.length;

    originalSentences.push({
      cleaned: cleanArxivText(trimmed),
      char_start: start,
      char_end: end
    });

    currentIndex = end + 1; // +1 for the space or newline that was split
  }

  const cleanedSentences = originalSentences
    .map((s, i) => ({ ...s, id: i }))
    .filter(item => item.cleaned.trim().length > 0);

  return cleanedSentences;
}


function createChunksPreservingId(sentencesWithIds, tokenizer, maxTokens, buffer) {
  const chunks = [];
  let currentChunk = [];
  let currentTokens = 0;

  for (const { cleaned, id, char_start, char_end } of sentencesWithIds) {
    const tokenCount = tokenizer.encode(cleaned).length;

    if (currentTokens + tokenCount > maxTokens - buffer) {
      if (currentChunk.length > 0) chunks.push([...currentChunk]);
      currentChunk = [{ cleaned, id,char_start, char_end  }];
      currentTokens = tokenCount;
    } else {
      currentChunk.push({ cleaned, id , char_start, char_end });
      currentTokens += tokenCount;
    }
  }

  if (currentChunk.length > 0) chunks.push([...currentChunk]);
  
  return assignLabeledChunks(chunks);
}

function assignLabeledChunks(chunksWithIds) {
  const labeled = {};
  for (let i = 0; i < chunksWithIds.length; i++) {
    const chunk = chunksWithIds[i];
    labeled[i] = {
      passages: chunk.map(({cleaned, id, char_start, char_end}) => `${cleaned.trim()} [${id}]\n`),
      info: [chunk.length, chunk[0].id],
      char_range: chunk.map(({cleaned, id, char_start, char_end}) => [char_start, char_end])
    };
  }
  return labeled;
}


async function getSummaryByChunk(
  labeledChunks
) {
  const summaryEntries = await Promise.all(
    Object.entries(labeledChunks).map(async ([indexStr, chunk]) => {
      const index = Number(indexStr);
      const passageText = chunk.passages.join("");
      const promptTemplate = get_combined_prompt(null);
      const summary = await getGemini(promptTemplate, passageText);
      console.log(`Generating summary for chunk ${index}`);
      return [index, summary.content.toString()] 
    })
  );

  return Object.fromEntries(summaryEntries);
}

async function getAllsummary(summaries_chunk){
  const allPassages= [];

  for (const chunk of Object.values(summaries_chunk)) {
    allPassages.push(chunk);
  }
  const PromptTemplate = get_combined_prompt(null);
  const allsummary = await getGemini(PromptTemplate, allPassages.join(""));
  return allsummary ;
}






// const citePassages = retrievePassageByCiteId(chunkswitlables,100)
async function getSummary(url) {
  
  const result = await getTextFromPDF(undefined, url);

  const allText = result.pages_list.join("");
  const cleanedSentences = get_chunks_with_ids(allText) 
  const chunkswitlables = createChunksPreservingId(cleanedSentences,tokenizer, 2500,50)
 const summaries_chunk = await getSummaryByChunk(chunkswitlables);


  const allsummary = await getAllsummary(summaries_chunk);
  //    console.log('====================================');
  // console.log(summaries_chunk,allsummary);
  // console.log('====================================');
  // return { labeledchunks, allsummary };
}
await getSummary(url)

// console.log('====================================');
// console.log(await getSummary(url));
// console.log('====================================');








 
