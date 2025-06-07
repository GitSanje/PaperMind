import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { HighlightType } from "@/components/context/globalcontext";
import { NewHighlightVarient } from "@/components/pdf/pdf-viewer";
import { hexToRgba } from "@/lib/utils";

/**
 * Generates a random string id used for highlights
 * @returns {string} random id string
 */
const getNextId = () => String(Math.random()).slice(2);

const initialState: { highlights: HighlightType[] } = {
  highlights: [],
};
export const highlightSlice = createSlice({
  name: "highlight",
  initialState,
  reducers: {
    addHighlight(
      state,
      action: PayloadAction<{ highlight: NewHighlightVarient; color?: string }>
    ) {
      const { highlight, color } = action.payload;
      const newHighlight = {
        ...highlight,
        id: getNextId(),
        color: hexToRgba(color || "#ffff00", 0.5), // fallback to yellow if no color
      };
      state.highlights.unshift(newHighlight);
    },
    deleteHighlight(state, action: PayloadAction<{ id: string }>) {
      state.highlights = state.highlights.filter(
        (h) => h.id !== action.payload.id
      );
    },
concatHighlights(
  state,
  action: PayloadAction<HighlightType[]>
) {
  state.highlights = state.highlights.concat(action.payload);
}
,
    updateHighlight(
      state,
      action: PayloadAction<{
        id: string;
        position?: Partial<HighlightType["position"]>;
        content?: Partial<HighlightType["content"]>;
        color?: string;
      }>
    ) {
      const { id, position, content, color } = action.payload;
      const index = state.highlights.findIndex((h) => h.id === id);
      if (index !== -1) {
        const existing = state.highlights[index];
        state.highlights[index] = {
          ...existing,
          position: { ...existing.position, ...position },
          content: { ...existing.content, ...content },
          color: color ? hexToRgba(color, 0.5) : existing.color,
        };
      }
    },
    updateHighlightColor(
      state,
      action: PayloadAction<{ id: string; color: string }>
    ) {
      const { id, color } = action.payload;
      
      const highlight = state.highlights.find((h) => h.id === id);
      if (highlight) {
         console.log('highlight from slice 2',color, highlight?.color,highlight?.id);
        highlight.color =  color //hexToRgba(color, 0.5);
      }
    },
  },
});



export const { addHighlight,deleteHighlight,updateHighlight,updateHighlightColor ,concatHighlights} = highlightSlice.actions

export default highlightSlice.reducer