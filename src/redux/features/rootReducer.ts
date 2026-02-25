import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { baseApi } from "../api/baseApi";
import authReducer from "./auth/authSlice";
import sidebarReducer from "./sidebar/sidebarSlice";
import searchMetaReducer from "./search/searchMetaSlice";

const persistConfig = {
  key: "auth",
  storage,
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);

export const reducer = {
  [baseApi.reducerPath]: baseApi.reducer,
  auth: persistedAuthReducer,
  sidebar: sidebarReducer,
  searchMeta: searchMetaReducer,
};
