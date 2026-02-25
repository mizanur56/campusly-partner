import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface SearchMetaState {
  courses: number;
  universities: number;
  totalResults?: number;
  totalArticles?: number;
}

const initialState: SearchMetaState = {
  courses: 0,
  universities: 0,
};

type SearchMetaPayload = {
  total?: number;
  totalCourses?: number;
  totalUniversities?: number;
  totalResults?: number;
  totalArticles?: number;
};

const searchMetaSlice = createSlice({
  name: "searchMeta",
  initialState,
  reducers: {
    updateCoursesMeta: (state, action: PayloadAction<SearchMetaPayload>) => {
      state.courses = action.payload.totalCourses ?? action.payload.total ?? 0;
      if (action.payload.totalUniversities !== undefined) state.universities = action.payload.totalUniversities;
    },
    updateUniversitiesMeta: (state, action: PayloadAction<SearchMetaPayload>) => {
      state.universities = action.payload.totalUniversities ?? action.payload.total ?? 0;
      if (action.payload.totalCourses !== undefined) state.courses = action.payload.totalCourses;
    },
    updateUnifiedMeta: (
      state,
      action: PayloadAction<{
        courses: number;
        universities: number;
        totalResults?: number;
        totalArticles?: number;
      }>
    ) => {
      state.courses = action.payload.courses;
      state.universities = action.payload.universities;
      state.totalResults =
        action.payload.totalResults ??
        action.payload.courses + action.payload.universities;
      state.totalArticles = action.payload.totalArticles;
    },
    resetSearchMeta: (state) => {
      state.courses = 0;
      state.universities = 0;
      state.totalResults = undefined;
      state.totalArticles = undefined;
    },
  },
});

export const {
  updateCoursesMeta,
  updateUniversitiesMeta,
  updateUnifiedMeta,
  resetSearchMeta,
} = searchMetaSlice.actions;
export default searchMetaSlice.reducer;
