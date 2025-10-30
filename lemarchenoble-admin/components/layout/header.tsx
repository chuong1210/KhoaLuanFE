"use client"

import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import { logout } from "@/store/slices/authSlice"
import { toggleDarkMode } from "@/store/slices/uiSlice"
import type { RootState } from "@/store"
import { Button } from "@/components/ui/button"
import { Moon, Sun, LogOut } from "lucide-react"

export function Header() {
  const dispatch = useDispatch()
  const router = useRouter()
  const darkMode = useSelector((state: RootState) => state.ui.darkMode)
  const auth = useSelector((state: RootState) => state.auth)

  const handleLogout = () => {
    dispatch(logout())
    router.push("/login")
  }

  return (
    <header className="fixed top-0 left-0 right-0 h-20 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-40">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-primary">Le Marche Noble</h1>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => dispatch(toggleDarkMode())}>
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </Button>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">{auth.userId}</span>
          <Button variant="ghost" size="icon" onClick={handleLogout} className="text-error hover:bg-error/10">
            <LogOut size={20} />
          </Button>
        </div>
      </div>
    </header>
  )
}
