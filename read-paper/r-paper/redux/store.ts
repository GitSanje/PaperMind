import { combineReducers, configureStore } from "@reduxjs/toolkit"
import storage from "redux-persist/lib/storage"  // defaults to localStorage
import highlightReducer from './highlightSlice'
import pdfreducer from './pdfSlice'
import { persistStore, persistReducer } from "redux-persist"

const highlightPersistConfig = {
    key:'highlights',
    storage,
    whitelist:['highlights']
}

const pdfPersistConfig = {
    key:'pdfsettings',
    storage,
    whitelist:['summary','citeHighlights','url','file','aiQuery']
}

  const rootReducer = combineReducers({
    highlight: persistReducer(highlightPersistConfig, highlightReducer),
    pdfsetting: persistReducer(pdfPersistConfig, pdfreducer)

  })

  export const store = configureStore({
   reducer: rootReducer,
   middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
              // Ignore these action types
              ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
              // Ignore these field paths in all actions
              ignoredActionPaths: ["meta.arg", "payload.timestamp"],
              
            },
          }), 
  })

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch