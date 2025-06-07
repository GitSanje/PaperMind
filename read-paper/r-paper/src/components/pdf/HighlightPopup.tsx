"use client"
import { useRef, useState } from "react";
import { HighlightType } from "../context/globalcontext";
import { MessageCircle, Palette, Trash2, X } from "lucide-react";
import { hexToRgba } from "@/lib/utils";
import { deleteHighlight, updateHighlightColor } from "../../../redux/highlightSlice";
import { setAiQuery, setTab } from "../../../redux/pdfSlice";

const colorOptions = ["#FFEB3B", "#4CAF50", "#2196F3", "#F44336", "#9C27B0"];

const HighlightPopup = ({
  highlight,
   onAskAI,
   dispatch
}: {
  highlight:HighlightType
   onAskAI: (text:string) =>void
   dispatch:any
}) => {

    
    const [showPopup, setShowPopup] = useState(false);

    const popupRef = useRef<HTMLDivElement>(null);
  const handleAskAI = () => {
    if (highlight.content?.text ) {
      dispatch(setAiQuery(highlight.content.text));
      dispatch(setTab('ai'))
      setShowPopup(false);
    }
  };

  const handleColorChange = (color: string) => {
       dispatch(updateHighlightColor({id: highlight.id, color: hexToRgba(color, 0.6)}))
      setShowPopup(false);
    };

    
  
  return (
         <div
          ref={popupRef}
       className="bg-white p-3 rounded-lg shadow-lg max-w-sm border"
        >
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-sm">Highlight Options</h4>
            <button
              onClick={() => setShowPopup(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-1 mb-2 text-xs text-gray-500">
                <Palette className="h-3 w-3" />
                <span>Change Color</span>
              </div>
              <div className="flex gap-2 justify-between">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(color)}
                    className={`w-8 h-8 rounded-full cursor-pointer transition-all ${
                      highlight.color === color
                        ? "ring-2 ring-offset-1 ring-black"
                        : "hover:scale-110"
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={`Change highlight color to ${color}`}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-2 border-t">
              <button
                onClick={() => {
                  if (deleteHighlight) {
                    dispatch(deleteHighlight({id: highlight.id}));
                  }

                  setShowPopup(false);
                }}
                className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
              >
                <Trash2 className="h-3 w-3" />
                Delete
              </button>

              <button
                onClick={handleAskAI}
                disabled={!highlight.content?.text}
                className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MessageCircle className="h-3 w-3" />
                Ask AI
              </button>
            </div>
          </div>
        </div>
  )
}



export default HighlightPopup
  