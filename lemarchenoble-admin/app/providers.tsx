"use client"

import type { ReactNode } from "react"
import { Provider } from "react-redux"
import { QueryClientProvider, QueryClient } from "@tanstack/react-query"
import { store } from "@/store"
import { Toaster } from "sonner"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
    },
  },
})

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster position="top-right" />
      </QueryClientProvider>
    </Provider>
  )
}
