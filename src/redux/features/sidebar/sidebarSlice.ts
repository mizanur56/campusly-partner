import { createSlice } from "@reduxjs/toolkit";

const sidebarSlice = createSlice({
  name: "sidebar",
  initialState: {
    isActive: false,
  },
  reducers: {
    toggleSidebar: (state) => {
      state.isActive = !state.isActive;
    },
    closeSidebar: (state) => {
      state.isActive = false;
    },
    openSidebar: (state) => {
      state.isActive = true;
    },
  },
});

export const { toggleSidebar, closeSidebar, openSidebar } =
  sidebarSlice.actions;
export default sidebarSlice.reducer;
