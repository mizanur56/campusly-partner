import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

export interface IUser {
  id: string;
  email: string;
  name: string;
  role: string;
  profile_photo?: string;
  last_login: Date;
  is_active: boolean;
  designationId?: string;
  designation?: {
    id: string;
    name: string;
    permissions: Array<{
      module: string;
      actions: string[];
    }>;
  };
  type: "user" | "employee";
}

interface TAuthState {
  user?: IUser | null;
  token?: string | null;
}

const initialState: TAuthState = {
  user: null,
  token: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ user: IUser; token: string }>) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
    },
    setProfile: (state, action) => {
      if (state.user) {
        state.user.profile_photo = action.payload;
      }
    },
    setRole: (state, action) => {
      if (state.user) {
        state.user.role = action.payload;
      }
    },
  },
});

export const { setUser, logout, setProfile, setRole } = authSlice.actions;
export default authSlice.reducer;

export const useCurrentToken = (state: RootState) => state.auth.token;
export const selectCurrentUser = (state: RootState) => state.auth.user;
