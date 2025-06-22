"use client"
import { getHighlightsByUserAndPdfId } from "@/actions/pdf";
import { HighlightType } from "@/components/context/globalcontext";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";


interface Props {
 id?:string 
  url: string | null;
  file:File | null;
  pdfTitle:string | null;
  citeHighlights: Array<HighlightType> | null;
  aiQuery: string;
  summary: string;
  tab: string;
  isSelecting: boolean;
}

const initialState: Props = {
  id: '',
  file: null,
  url: null,
  pdfTitle:'',
  citeHighlights:null,
  aiQuery: '',
  summary: '',
  tab: 'tool',
  isSelecting: true,
};


const pdfSlice = createSlice({
  name: 'pdf',
  initialState,
  reducers: {
     updatePdfState(state, action: PayloadAction<Partial<Props>>) {
      Object.entries(action.payload).forEach(([key, value]) => {
        // @ts-ignore – trusted keys from Partial<Props>
        state[key] = value;
      });
    },
   
    removeHighlight(state, action: PayloadAction<string>) {
      state.citeHighlights = state.citeHighlights?.filter(h => h.id !== action.payload)!;
    },
    resetPdfState() {
      return initialState;
    },
  },
});

export const {

  resetPdfState,
  removeHighlight,
  updatePdfState
} = pdfSlice.actions;

export default pdfSlice.reducer;
