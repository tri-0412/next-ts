/* eslint-disable @typescript-eslint/no-unused-vars */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  id: string;
  email: string;
}

interface AuthState {
  user: User | null;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginRequest: (
      _state,
      _action: PayloadAction<{ email: string; password: string }>
    ) => {
      // Reducer này không thực hiện gì vì nó chỉ để trigger action
    },
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
});

export const { loginRequest, loginSuccess, loginFailure } = authSlice.actions;
export default authSlice.reducer;
