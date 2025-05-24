"use client";
import React from "react";
import ReactMarkdown from "react-markdown";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

type CustomParagraphProps = {
  children?: React.ReactNode;
  scrollToCitation: (id: number) => void;
};

// Renders a styled clickable citation badge
const Citation = ({
  number,
  onClick,
}: {
  number: string;
  onClick: (id: number) => void;
}) => (
  <span
    className="inline-block mx-0.5 px-1 py-0.5 border border-indigo-700 rounded text-xs font-medium align-middle text-white bg-indigo-700 cursor-pointer"
    onClick={() => onClick(Number(number))}
  >
    {number}
  </span>
);

// Parses citations in paragraph text and replaces with Citation components
const CustomParagraph: React.FC<CustomParagraphProps> = ({
  children,
  scrollToCitation,
}) => {
  const processChildren = (child: React.ReactNode): React.ReactNode => {
    if (typeof child !== "string") {
      const element = child as React.ReactElement<{
        children?: React.ReactNode;
      }>;
      if (React.isValidElement(child) && element.props.children) {
        return React.cloneElement(element, {
          ...element.props,
          children: React.Children.map(element.props.children, processChildren),
        });
      }
      return child;
    }

    // Split string by citation patterns
    const parts = child.split(/(\[\d+(?:,\s*\d+)*\])/g);

    return parts.map((part, index) => {
      const match = part.match(/\[(\d+(?:,\s*\d+)*)\]/);
      if (!match) return part;

      const numbers = match[1]
        .split(",")
        .map((n) => n.trim())
        .slice(0, 3);

      return (
        <React.Fragment key={index}>
          {numbers.map((num, i) => (
            <Citation
              key={`${num}-${i}`}
              number={num}
              onClick={scrollToCitation}
            />
          ))}
        </React.Fragment>
      );
    });
  };

  return (
    <p style={{ wordWrap: "break-word" }}>
      {React.Children.map(children, processChildren)}
    </p>
  );
};

/**
 * Escapes math delimiters by doubling backslashes
 * @param {string} input - raw LaTeX string
 * @returns {string} sanitized string for rendering
 */
export function escapeBackslashesStrict(input: string): string {
  let step2 = input.replace(/\\\(/g, "/\\\\(/");
  return step2;
}

/**
 * Converts LaTeX math delimiters to Markdown-compatible ones
 * @param {string} markdown - raw markdown with LaTeX
 * @returns {string} transformed markdown
 */
export function processKatexInMarkdown(markdown: string) {
  if (!markdown) return;
  return markdown
    .replace(/\\\\\[/g, "$$$$")
    .replace(/\\\\\]/g, "$$$$")
    .replace(/\\\\\(/g, "$$$$")
    .replace(/\\\\\)/g, "$$$$")
    .replace(/\\\[/g, "$$$$")
    .replace(/\\\]/g, "$$$$")
    .replace(/\\\(/g, "$$$$")
    .replace(/\\\)/g, "$$$$");
}

// Renders Markdown content with math and citation support
export default function MathRenderer({ text }: { text?: string }) {
  if (!text) return;

  const input = text;

  const updateHash = (id: number) => {
    document.location.hash = `highlightcite-${id}`;
  };
  const scrollToCitation = (id: number) => {
    updateHash(id);
  };

  return (
    <ReactMarkdown
      children={processKatexInMarkdown(input)}
      remarkPlugins={[
        remarkGfm, // GitHub-flavored Markdown (tables, strikethrough, etc.)
        [remarkMath], // Parses inline/block math expressions like $...$ or $$...$$
       
      ]}
     rehypePlugins={[
                () => {
                    return rehypeKatex({ output: 'htmlAndMathml'});
                },
            ]}// Renders parsed LaTeX math as HTML + MathML using KaTeX
      components={{
        p: ({ node, ...props }) => (
          // Custom rendering for <p> tags to support citations
          <CustomParagraph {...props} scrollToCitation={scrollToCitation} />
        ),
      }}
    />
  );
}
