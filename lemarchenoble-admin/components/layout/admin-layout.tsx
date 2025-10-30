"use client"

import type React from "react"

import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { Sidebar } from "./sidebar"
import { Header } from "./header"

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const collapsed = useSelector((state: RootState) => state.ui.sidebarCollapsed)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar />
      <main className={`transition-all duration-300 pt-20 ${collapsed ? "ml-20" : "ml-64"}`}>
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
