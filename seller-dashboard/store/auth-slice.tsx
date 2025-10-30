import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { cookies } from "@/lib/utils/cookies";
import { decodeToken } from "@/lib/utils/jwt";

interface AuthState {
  token: string | null;
  userId: string | null;
  shopId: string | null;
  role: string | null;
  username: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
}

const getInitialState = (): AuthState => {
  if (typeof window === "undefined") {
    return {
      token: null,
      userId: null,
      shopId: null,
      role: null,
      username: null,
      isAuthenticated: false,
      isInitialized: false,
    };
  }

  const token = cookies.get("token");

  if (token) {
    try {
      const decoded = decodeToken(token);
      if (!decoded) {
        console.error("[v0] Decoded token is null or undefined");
        cookies.remove("token");
      } else {
        console.log("[v0] Initializing auth from cookies:", decoded);
        return {
          token,
          userId: decoded.userId ?? null,
          shopId: decoded.shopId ?? null,
          role: decoded.scope ?? null,
          username: decoded.username ?? null,
          isAuthenticated: true,
          isInitialized: true,
        };
      }
    } catch (error) {
      console.error("[v0] Failed to decode token from cookies:", error);
      cookies.remove("token");
    }
  }

  return {
    token: null,
    userId: null,
    shopId: null,
    role: null,
    username: null,
    isAuthenticated: false,
    isInitialized: true,
  };
};

const authSlice = createSlice({
  name: "auth",
  initialState: getInitialState(),
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        token: string;
        userId: string;
        shopId: string | null;
        role: string;
        username: string;
      }>
    ) => {
      console.log("[v0] Setting credentials:", action.payload);
      state.token = action.payload.token;
      state.userId = action.payload.userId;
      state.shopId = action.payload.shopId;
      state.role = action.payload.role;
      state.username = action.payload.username;
      state.isAuthenticated = true;
      state.isInitialized = true;
    },
    logout: (state) => {
      console.log("[v0] Logging out");
      state.token = null;
      state.userId = null;
      state.shopId = null;
      state.role = null;
      state.username = null;
      state.isAuthenticated = false;
      state.isInitialized = true;
      cookies.remove("token");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
