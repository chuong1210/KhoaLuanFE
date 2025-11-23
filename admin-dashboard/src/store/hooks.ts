import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux'
import type { RootState, AppDispatch } from './store'

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

// Auth selectors
export const useAuth = () => useAppSelector((state) => state.auth)
export const useUser = () => useAppSelector((state) => state.auth.user)
export const useIsAuthenticated = () => useAppSelector((state) => state.auth.isAuthenticated)

// UI selectors
export const useUi = () => useAppSelector((state) => state.ui)
export const useSidebarOpen = () => useAppSelector((state) => state.ui.sidebarOpen)
export const useSidebarCollapsed = () => useAppSelector((state) => state.ui.sidebarCollapsed)
