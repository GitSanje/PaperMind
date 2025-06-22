"use client";
import "react-pdf-highlighter/dist/style/Highlight.css";
import type React from "react";

import type { LTWHP } from "react-pdf-highlighter";
import { hexToRgba } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { Trash2, MessageCircle, Palette, X } from "lucide-react";
import { HighlightType } from "../context/globalcontext";
import { deleteHighlight, updateHighlightColor } from "../../../redux/highlightSlice";


interface Props {
  position: {
    boundingRect: LTWHP;
    rects: Array<LTWHP>;
  };
  onClick?: () => void;
  onMouseOver?: () => void;
  onMouseOut?: () => void;
  comment: {
    emoji?: string;
    text?: string;
  };
  isScrolledTo: boolean;
  highlightColor?: string;
  highlight: HighlightType;

}

const colorOptions = ["#FFEB3B", "#4CAF50", "#2196F3", "#F44336", "#9C27B0"];



export function CustomHighlight({
  position,
  onClick,
  onMouseOver,
  onMouseOut,
  comment,
  isScrolledTo,
  highlightColor,
  highlight,
 
}: Props) {
  const { rects, boundingRect } = position;
  
  

  return (
    <div
      className={` relative  ${
        isScrolledTo ? "bg-red-700" : ""
      }`}
      style={{
        backgroundColor: isScrolledTo
          ? "#ff4141"
          : undefined,
      }}
    >
      {comment?.emoji ? (
        <div
          className="Highlight__emoji"
          style={{
            left: 20,
            top: boundingRect.top,
          }}
        >
          {comment.emoji}
          {comment.text}
        </div>
      ) : null}

      <div className="Highlight__parts">
         {!highlight.url ?
         
         rects.map((rect, index) => (
          <div
            onMouseOver={onMouseOver}
            onMouseOut={onMouseOut}
           
            key={index}
            style={{
              ...rect,
              backgroundColor: isScrolledTo
          ?hexToRgba( "#ff4141",0.5): highlightColor || highlight.color|| "bg-red-700",
            }}
            className="Highlight__part"
          />
         ))
          :
          isScrolledTo && 
              (  <div
            onMouseOver={onMouseOver}
            onMouseOut={onMouseOut}
           
            style={{
              ...boundingRect,
              backgroundColor:  " rgba(255, 226, 143, 1)",
            }}
            className="Highlight__part"
          /> 
          )

        } 
      
         

          
      </div>

   
    </div>
  );
}
