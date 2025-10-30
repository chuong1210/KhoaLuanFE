"use client"

import Link from "next/link"
import { useSelector, useDispatch } from "react-redux"
import { toggleSidebar } from "@/store/slices/uiSlice"
import type { RootState } from "@/store"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Package, Store, ShoppingCart, Users, Settings, Menu, X } from "lucide-react"

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
  { icon: Package, label: "Sản phẩm", href: "/admin/products" },
  { icon: Store, label: "Cửa hàng", href: "/admin/shops" },
  { icon: ShoppingCart, label: "Đơn hàng", href: "/admin/orders" },
  { icon: Users, label: "Người dùng", href: "/admin/users" },
  { icon: Settings, label: "Cài đặt", href: "/admin/settings" },
]

export function Sidebar() {
  const dispatch = useDispatch()
  const collapsed = useSelector((state: RootState) => state.ui.sidebarCollapsed)

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-primary text-white transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      } pt-20 border-r border-primary/20`}
    >
      <div className="p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => dispatch(toggleSidebar())}
          className="text-white hover:bg-primary/80 w-full"
        >
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </Button>
      </div>

      <nav className="space-y-2 px-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href}>
              <Button variant="ghost" className="w-full justify-start text-white hover:bg-primary/80">
                <Icon size={20} />
                {!collapsed && <span className="ml-3">{item.label}</span>}
              </Button>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
