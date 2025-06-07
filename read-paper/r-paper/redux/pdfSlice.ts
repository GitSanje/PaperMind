import { HighlightType } from "@/components/context/globalcontext";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PDFDocumentProxy } from "pdfjs-dist";

interface Props {
 
  url: string | null;
  file:File | null;
  citeHighlights: Array<HighlightType> | null;
  aiQuery: string;
  summary: string;
  tab: string;
  isSelecting: boolean;
}

const initialState: Props = {

  file: null,
  url: null,
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
    
    setUrl(state, action: PayloadAction<string | null>) {
      state.url = action.payload;
    },
    setFile(state, action: PayloadAction<File | null>) {
      state.file = action.payload;
    },
    setCiteHighlights(state, action: PayloadAction<Array<HighlightType>>) {
      state.citeHighlights = action.payload;
    },
    setAiQuery(state, action: PayloadAction<string>) {
      state.aiQuery = action.payload;
    },
    setSummary(state, action: PayloadAction<string>) {
      state.summary = action.payload;
    },
    setTab(state, action: PayloadAction<string>) {
      state.tab = action.payload;
    },
    setIsSelecting(state, action: PayloadAction<boolean>) {
      state.isSelecting = action.payload;
    },
    addCiteHighlight(state, action: PayloadAction<HighlightType[]>) {
      state.citeHighlights = action.payload;
    },
   
    removeHighlight(state, action: PayloadAction<string>) {
      state.citeHighlights = state.citeHighlights?.filter(h => h.id !== action.payload)!;
    },
  },
});

export const {

  setUrl,
  setCiteHighlights,
  setAiQuery,
  setSummary,
  setTab,
  setIsSelecting,
  addCiteHighlight,
  setFile,
  removeHighlight,
} = pdfSlice.actions;

export default pdfSlice.reducer;
