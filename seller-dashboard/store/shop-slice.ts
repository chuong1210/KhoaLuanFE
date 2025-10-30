import { ShopData } from "@/types/shop";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";



interface ShopState {
  data: ShopData | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ShopState = {
  data: null,
  isLoading: false,
  error: null,
};

const shopSlice = createSlice({
  name: "shop",
  initialState,
  reducers: {
    setShopLoading: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    setShopData: (state, action: PayloadAction<ShopData>) => {
      state.data = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setShopError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearShop: (state) => {
      state.data = null;
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const { setShopLoading, setShopData, setShopError, clearShop } =
  shopSlice.actions;
export default shopSlice.reducer;
