"use client"
import React, { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { InlineMath, BlockMath } from "react-katex";
import 'katex/dist/katex.min.css'; 
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import Latext from 'react-latex-next'
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useGlobalContext } from "../context/globalcontext";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";





type CustomParagraphProps = {
  children?: React.ReactNode;
  scrollToCitation: (id: number) => void;
};


// This is a React component to render citations~
const Citation = ({ number, onClick }: { number: string; onClick: (id: number) => void }) => (
  <span
    className="inline-block mx-0.5 px-1 py-0.5 border border-indigo-700 rounded text-xs font-medium align-middle text-white bg-indigo-700 cursor-pointer"
    onClick={() => onClick(Number(number))}
  >
    {number}
  </span>
)

const CustomParagraph: React.FC<CustomParagraphProps> = ({ children, scrollToCitation }) => {
  const processChildren = (child: React.ReactNode): React.ReactNode => {
    if (typeof child !== "string") {
      // If not a string, check if it's a valid React element and has children
              const element = child as React.ReactElement<{ children?: React.ReactNode }>;
      if (React.isValidElement(child) && element.props.children ) {

        return React.cloneElement(element, {
          ...element.props,
          children: React.Children.map(element.props.children, processChildren),
        });
      }
      return child;
    }

    // If it's a string, look for citation patterns
    const parts = child.split(/(\[\d+(?:,\s*\d+)*\])/g);

    return parts.map((part, index) => {
      const match = part.match(/\[(\d+(?:,\s*\d+)*)\]/);
      if (!match) return part;

      const numbers = match[1].split(",").map((n) => n.trim()).slice(0, 3);

      

      return (
        <React.Fragment key={index}>
          {numbers.map((num, i) => (
            <Citation key={`${num}-${i}`} number={num} onClick={scrollToCitation} />
          ))}
        </React.Fragment>
      );
    });
  };

  return <p style={{ wordWrap: "break-word" }}>{React.Children.map(children, processChildren)}</p>;
};




export function processKatexInMarkdown(markdown: string) {
    const markdownWithKatexSyntax = markdown
        .replace(/\\\\\[/g, '$$$$') // Replace '\\[' with '$$'
        .replace(/\\\\\]/g, '$$$$') // Replace '\\]' with '$$'
        .replace(/\\\\\(/g, '$$$$') // Replace '\\(' with '$$'
        .replace(/\\\\\)/g, '$$$$') // Replace '\\)' with '$$'
        .replace(/\\\[/g, '$$$$') // Replace '\[' with '$$'
        .replace(/\\\]/g, '$$$$') // Replace '\]' with '$$'
        .replace(/\\\(/g, '$$$$') // Replace '\(' with '$$'
        .replace(/\\\)/g, '$$$$')
    return markdownWithKatexSyntax;
}


export default function MathRenderer({ text }: { text?: string }) {
  
  const input =  text;

  const updateHash = (id:number) => {
    document.location.hash = `highlightcite-${id}`
  }


  const scrollToCitation = (id: number) => {
     updateHash(id)
};


 const markdownWithKatexSyntax = processKatexInMarkdown(input!);


  // Split by:
  // - block math: \begin{...}...\end{...}
  // - inline math: \( ... \)
  const parts = input?.split(

    /(\$\$[\s\S]+?\$\$|\\begin\{[\s\S]*?\}[\s\S]*?\\end\{[\s\S]*?\}|\\\([^\)]*?\\\)|\\\[[\s\S]*?\\\])/g
  )?.filter(Boolean);
  // return (
  //   <div className="prose max-w-none">
  //     {parts?.map((part, i) => {
         
  //       if (!part) return;

       
  //      if (
  //   part.startsWith("$$") && part.endsWith("$$") ||
  //   part.startsWith("\\[") && part.endsWith("\\]") ||
  //   part.includes("\\begin{") && part.includes("\\end{")
  // ) {
  //         const math = part
  //     .replace(/^\$\$|\$\$$/g, "") // remove $$ if any
  //     .replace(/^\\\[|\\\]$/g, "");// remove \[ and \]  
  //      console.log('====================================');
  //       console.log(`block part :${part}`);
  //       console.log('====================================');
       
  //         return (
  //           <div key={i}  className="overflow-auto whitespace-pre-wrap my-4">
  //             <BlockMath math={math} errorColor="#cc0000" />
  //           </div>
  //         );
  //       } else if (part.startsWith("\\(") && part.endsWith("\\)") || (part.startsWith("\(") && part.endsWith("\)")  )) {
  //         const math = part.slice(2, -2);
  //                 console.log('====================================');
  //       console.log(`inline part :${part}`);
  //       console.log('====================================');
  //         return (
  //           <span key={i} className="inline-block align-middle">
  //             <InlineMath math={math} errorColor="#cc0000" />
  //           </span>
           
  //         );
  //       } else {
  //           console.log('====================================');
  //       console.log(`markdown part :${part}`);
  //       console.log('====================================');
                    
  //         return (
  //           <div
  //             className="overflow-auto whitespace-pre-wrap my-4"
  //             style={{ wordWrap: "break-word" }}
  //           >
  //             <ReactMarkdown
  //               remarkPlugins={[remarkGfm, remarkBreaks]}
  //               rehypePlugins={[rehypeRaw]}
  //             components={{
  //                 p: ({ node, ...props }) => <CustomParagraph {...props} scrollToCitation={scrollToCitation} />,
  //               }}
              
  //             >
            
  //              {part}

  //             </ReactMarkdown>
  //           </div>
  //         );
  //       }
  //     })}
  //   </div>
  // );
   return   <ReactMarkdown
                 remarkPlugins={[remarkGfm, [remarkMath, { singleDollarTextMath: false }]]}

       rehypePlugins={[
                () => {
                    return rehypeKatex({ output: 'htmlAndMathml'});
                },
            ]}
            components={{
                  p: ({ node, ...props }) => <CustomParagraph {...props} scrollToCitation={scrollToCitation} />,
                }}
    >
      {markdownWithKatexSyntax}
    </ReactMarkdown>
}

