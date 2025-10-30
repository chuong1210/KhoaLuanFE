import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./auth-slice"
import shopReducer from "./shop-slice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    shop: shopReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
