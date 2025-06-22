"use client";
import { getNotionIntegrationAndDB, Status } from "@/actions/notion";

import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Props {
  isConnected: boolean;
  notionData: any;
  availablePages: any[];
  selectedParentPage: string;
  databaseUrl: string;
  databaseId: string;
  highlightStatus: {
    id: string;
    status: Status;
  }[];
  syncResults: any;
  loading:boolean;
  error:string |null;
}

const initialState: Props = {
  isConnected: false,
  notionData: {},
  availablePages: [],
  highlightStatus: [],
  selectedParentPage: "",
  databaseUrl: "",
  databaseId: "",
  syncResults: null,
  loading:false,
  error:null

};


export const fetchNotionData = createAsyncThunk<
any,
 {userId:string},
  { rejectValue: string }>
  (
  "notion/fetchNotionData",
   async ({userId} , thunkApi) => {

    try {
        if (!userId ) {
        return thunkApi.rejectWithValue("Missing userId");
      }

      const result =  await getNotionIntegrationAndDB(userId)
       if (!result.success ) {
        return thunkApi.rejectWithValue("No notion data found.");
      }
      return result

    } catch (error) {
      console.error("Error fetching notion data:", error);
      return thunkApi.rejectWithValue("Failed to fetch notion data.");
    }

   }



)

const notionSlice = createSlice({
  name: "notion",
  initialState,
  reducers: {
   updateNotionState(state, action: PayloadAction<Partial<Props>>) {
  Object.entries(action.payload).forEach(([key, value]) => {
    if (key === "highlightStatus" && value) {
      const incoming = Array.isArray(value) ? value : [value];

      // Avoid pushing duplicates (optional enhancement)
      incoming.forEach((incomingStatus) => {
        const exists = state.highlightStatus.find(
          (s) => s.id === (incomingStatus as any).id
        );
        if (!exists) {
          state.highlightStatus.push(incomingStatus as any);
        }
      });
    } else {
      // @ts-ignore – trusted keys from Partial<Props>
      state[key] = value;
    }
  });
}

  },
  extraReducers : (builder) =>{
     builder
        .addCase(fetchNotionData.fulfilled, (state,action) => {
           state.loading = false;
           state.isConnected = true
           const {integration, databases} = action.payload
           state.notionData = integration
           if(databases.length>0){
            state.databaseId = databases[0].id
            state.databaseUrl = databases[0].url
           }
         
        })
        .addCase(fetchNotionData.rejected, (state, action) => {
            state.loading = false;
            state.isConnected = false;
            state.error = action.payload as string;
          })
      
  },
});

export const {  updateNotionState } = notionSlice.actions;

export default notionSlice.reducer;
