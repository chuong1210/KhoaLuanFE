import { createSlice } from "@reduxjs/toolkit"

interface UIState {
  sidebarCollapsed: boolean
  darkMode: boolean
}

const initialState: UIState = {
  sidebarCollapsed: false,
  darkMode: false,
}

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode
    },
  },
})

export const { toggleSidebar, toggleDarkMode } = uiSlice.actions
export default uiSlice.reducer
