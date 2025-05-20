
import { fromPreTrained } from "@lenml/tokenizer-gemini";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
export interface PageDict {
  [key: number]: string[];
}

export interface GetPDFResult {
  pages_dict: PageDict;
  pages_list: string[];
}
export interface ChunkedPassage {
  passages: string[];
  info: [number, number]; // [chunkLength, firstSentenceId]
  char_range: [number, number][];
}

export interface LabeledChunks {
  [chunkIndex: number]: ChunkedPassage;
}

export interface SentenceWithId {
  cleaned: string;
  char_start: number;
  char_end: number;
  id: number;
}

export function cleanArxivText(text: string) {
  // Remove inline LaTeX math like $...$
  text = text.replace(/\$.*?\$/g, "");

  // Remove LaTeX environments like \begin{...} and \end{...}
  text = text.replace(/\\(begin|end)\{.*?\}/g, "");

  // Remove URLs and mentions
  text = text.replace(/http\S+|www\S+|@\S+/g, "");

  // Remove LaTeX commands like \command or \command[opt]{arg}
  text = text.replace(/\\[a-zA-Z]+(\[[^\]]*\])?(\{[^\}]*\})?/g, "");

  // Remove LaTeX-style citations or malformed refs like ( * ? )
  text = text.replace(/\(\s*\*?\s*\?\s*\)/g, "");

  // Remove lone question marks or surrounded by punctuation
  text = text.replace(/["',]*\?+["',]*/g, "");

  // Remove multiple quotes/commas
  text = text.replace(/["',]{2,}/g, "");

  // Remove spaces before multiple dots
  text = text.replace(/\s\.{2,}/g, " ");

  // Remove multiple dots, keep only one
  text = text.replace(/\.(?=.*\.)/g, " ");

  // Remove digits followed by dot (e.g., 1. 2. etc.)
  text = text.replace(/\d\./g, " ");

  // Remove References/Bibliography section
  const referencesPattern =
    /(References|Bibliography|References\s?and\s?Acknowledgements).*?(?=\n\n[A-Z][a-z]+\s.*|$)/g;
  text = text.replace(referencesPattern, "");

  // Collapse multiple spaces
  return text.replace(/\s+/g, " ").trim();
}


export const tokenizer = fromPreTrained();

export function get_splitter(
  tokenizer: any,
  chunk_size: number,
  chunk_overlap: number
) {
  const token_length = (text: string): number => tokenizer.encode(text).length;

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: chunk_size,
    chunkOverlap: chunk_overlap,
    lengthFunction: token_length,
  });

  return splitter;
}


// export function chunkByTokens(
//   tokenizer: any,
//   text: string,
//   maxTokens = 2000,
//   buffer = 50
// ): string[][] {
//   const cleanedText = cleanArxivText(text);
//   const sentences = cleanedText.trim().split(/(?<=[.!?])\s+/);
//   return createChunks(tokenizer, sentences, maxTokens, buffer);
// }

// export function createChunks(
//   tokenizer: any,
//   texts: string[],
//   maxTokens: number,
//   buffer: number
// ): string[][] {
//   const chunks: string[][] = [];
//   let currentChunk: string[] = [];
//   let currentTokens = 0;

//   for (const sentence of texts) {
//     const tokenCount = tokenizer.encode(sentence).length;

//     if (currentTokens + tokenCount > maxTokens - buffer) {
//       if (currentChunk.length > 0) {
//         chunks.push([...currentChunk]);
//       }
//       currentChunk = [sentence];
//       currentTokens = tokenCount;
//     } else {
//       currentChunk.push(sentence);
//       currentTokens += tokenCount;
//     }
//   }

//   if (currentChunk.length > 0) {
//     chunks.push([...currentChunk]);
//   }

//   return chunks;
// }


//  function assignLabel(corpus: string[], prevChunkSize = 0): string[] {
//   return corpus.map((sentence, i) => {
//     const index = i + prevChunkSize;
//     return `${sentence.trim()} [${index}]\n`;
//   });
// }

// export function assignLabelAll(chunks: string[][]): Record<number, PassageLabel> {
//   const passageLabels: Record<number, PassageLabel> = {};

//   let prevChunkEnd = 0;

//   chunks.forEach((chunk, i) => {
//     const chunkLen = chunk.length;

//     passageLabels[i] = {
//       passages: assignLabel(chunk, prevChunkEnd),
//       info: [chunkLen, prevChunkEnd],
//     };

//     prevChunkEnd += chunkLen;
//   });
//   return passageLabels;
// }


export function get_chunks_with_ids(text: string): SentenceWithId[] {
  const referencesPattern = /(References|Bibliography|References\s?and\s?Acknowledgements).*?(?=\n\n[A-Z][a-z]+\s.*|$)/g;
  const allText = text.replace(referencesPattern, '');
  const originalSentences: Omit<SentenceWithId, 'id'>[] = [];

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

  const cleanedSentences: SentenceWithId[] = originalSentences
    .map((s, i) => ({ ...s, id: i }))
    .filter(item => item.cleaned.trim().length > 0);

  return cleanedSentences;
}

// Create chunks from sentences
export function createChunksPreservingId(
  sentencesWithIds: SentenceWithId[],
  tokenizer: { encode: (s: string) => { length: number } | any[] },
  maxTokens: number,
  buffer: number
): LabeledChunks {
  const chunks: SentenceWithId[][] = [];
  let currentChunk: SentenceWithId[] = [];
  let currentTokens = 0;

  for (const sentence of sentencesWithIds) {
    const tokenCount = tokenizer.encode(sentence.cleaned).length;

    if (currentTokens + tokenCount > maxTokens - buffer) {
      if (currentChunk.length > 0) chunks.push([...currentChunk]);
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

  return assignLabeledChunks(chunks);
}

// Assign labeled structure
function assignLabeledChunks(chunksWithIds: SentenceWithId[][]): LabeledChunks {
  const labeled: LabeledChunks = {};

  chunksWithIds.forEach((chunk, i) => {
    labeled[i] = {
      passages: chunk.map(
        ({ cleaned, id }) => `${cleaned.trim()} [${id}]\n`
      ),
      info: [chunk.length, chunk[0].id],
      char_range: chunk.map(({ char_start, char_end }) => [char_start, char_end])
    };
  });

  return labeled;
}

export function get_combined_prompt(text: string | null) {
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
          • Use **inline LaTeX** for inline expressions: wrap in \\( ... \\)
          • Use **block LaTeX** for equations or aligned expressions: wrap in \\begin... \\end
        - Do **not** repeat sentences from the input or simply rephrase them mechanically — instead, paraphrase and condense the ideas clearly, removing unnecessary or redundant details.
        - If appropriate, feel free to use:
        • **Bullet points or numbered lists** for clarity.
        • **Mathematical notation in LaTeX** for formulas or equations.
        • **Tables** to organize structured information.

        Each sentence in the input is annotated with a label like [n]. Use these for traceability in your output.

        Avoid including extra words like “summary” or “document” — just provide the final composed summary.

        Input format:
        <sentence>. [n] <next sentence>. [m]
        Example of proper formatting:
      - Inline math: \\( f_\\theta(x) := (x; \\theta) \\),
      - Block math:
          should start with \\begin ( should have two \\) and end with \\end
         Text:
       {text}

        <|assistant|>
        `;
  return combined_prompt;
}


export function retrievePassageByCiteId(
  labeledChunks: LabeledChunks,
  id: number
) {
  for (const [key,chunk ] of Object.entries(labeledChunks)) {
    const start = chunk.info[1];
    const end = chunk.info[0] + chunk.info[1];
    if (id >= start && id < end) {
      const index = id - start
      return [chunk.passages[index], key,chunk.char_range[index]];
    }
  }

  return undefined; // not found
}

export interface passacesCites{
  [id: string] :  {sen:string, range: [number,number]}
      
    
}

export function retrieveAllPassageByCiteId(labeledChunks:LabeledChunks, ids:number[] ){
    const passages_cites:passacesCites= {}
    for (const id of ids){
       const result = retrievePassageByCiteId(labeledChunks,id)
       passages_cites[id] = {
        sen: result?.[0],
        range: result?.[2]
       }
      

    }

    return passages_cites
    
}

export function findNumbers(text: string): number[] {
  const regex = /\[(\d+(?:,\s*\d+)*)\]/g;
  const result: number[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const nums = match[1]
      .split(',')
      .map(x => parseInt(x.trim(), 10));
    result.push(...nums);
  }

  return result;
}
