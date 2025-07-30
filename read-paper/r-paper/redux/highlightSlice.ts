"use client";
import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { HighlightType } from "@/components/context/globalcontext";
import { NewHighlightVarient } from "@/components/pdf/pdf-viewer";
import { hexToRgba } from "@/lib/utils";
import { deleteHighlightDB, getAllHashDataFromRedis, getHighlightsByUserAndPdfId } from "@/actions/pdf";



/**
 * Generates a random string id used for highlights
 * @returns {string} random id string
 */
const getNextId = () => String(Math.random()).slice(2);

interface Props { highlights: HighlightType[],error:string|null,loading:boolean}
const initialState:Props = {
  highlights: [],
  error:null,
  loading:false

};

export const fetchHighlights = createAsyncThunk<
  any[], // return type on success
  { userId: string; pdfId: string }, // argument type
  { rejectValue: string } // rejection error type
>(
  "highlight/fetchHighlights",
  async ({ userId, pdfId }, thunkApi) => {
    try {
      if (!userId || !pdfId) {
        return thunkApi.rejectWithValue("Missing userId or pdfId");
      }
      const key = `highlights:${userId}:${pdfId}`;
      //const result = await getHighlightsByUserAndPdfId(userId, pdfId);
      const result = await getAllHashDataFromRedis(key)
      const highlights = result.data  ?? []; 
      
      if (!result.exists || highlights.length === 0) {
        return thunkApi.rejectWithValue("No highlights found.");
      }

      return highlights;
    } catch (error) {
      console.error("Error fetching highlights:", error);
      return thunkApi.rejectWithValue("Failed to fetch highlights.");
    }
  }
);



export const highlightSlice = createSlice({
  name: "highlight",
  initialState,
  reducers: {
    addHighlight(
      state,
      action: PayloadAction<{
        highlight: NewHighlightVarient;
        color?: string;
        id: string;
      }>
    ) {
      const { highlight, color, id } = action.payload;

      // Check if identical highlight already exists (based on position and content hash)
      const isDuplicate = state.highlights.some(
        (h) =>
          h.position.pageNumber === highlight.position.pageNumber &&
          h.content.text === highlight.content.text // you can enhance this comparison
      );

      if (!isDuplicate) {
        const newHighlight = {
          ...highlight,
          id: id,
          color: hexToRgba(color || "#ffff00", 0.5),
        };
        state.highlights.unshift(newHighlight);
      }
    },
    deleteHighlight(state, action: PayloadAction<{ id: string }>) {
      state.highlights = state.highlights.filter(
        (h) => h.id !== action.payload.id
      );
      
    },
    concatHighlights(state, action: PayloadAction<HighlightType[]>) {
      state.highlights = state.highlights.concat(action.payload);
    },
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
        highlight.color = color; //hexToRgba(color, 0.5);
      }
    },

     updateHState(state, action: PayloadAction<Partial<Props>>) {
          Object.entries(action.payload).forEach(([key, value]) => {
            // @ts-ignore – trusted keys from Partial<Props>
            state[key] = value;
          });
        },
        resetHState() {
      return initialState;
    },
  },
  extraReducers: (builder) =>{

    builder
    .addCase(fetchHighlights.fulfilled, (state,action) => {
       state.loading = false;
      if (state.highlights.length === 0 ) {
        state.highlights = action.payload;
      }
    })
    .addCase(fetchHighlights.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchHighlights.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      
  },
});

export const {
  addHighlight,
  deleteHighlight,
  updateHighlight,
  updateHighlightColor,
  concatHighlights,
  updateHState,
  resetHState
} = highlightSlice.actions;

export default highlightSlice.reducer;
