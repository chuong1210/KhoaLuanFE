'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bell,
  Search,
  Menu,
  LogOut,
  User,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppDispatch, useUser, useSidebarCollapsed } from '@/store'
import { logout } from '@/store/slices/authSlice'
import { toggleSidebar } from '@/store/slices/uiSlice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getInitials } from '@/lib/utils'

export function Header() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const user = useUser()
  const isCollapsed = useSidebarCollapsed()
  const [searchQuery, setSearchQuery] = useState('')

  const handleLogout = () => {
    dispatch(logout())
    router.push('/auth/login')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Implement search functionality
    console.log('Search:', searchQuery)
  }

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-30 h-16 bg-gradient-warm-peach border-b border-orange-peach/30 transition-all duration-300',
        isCollapsed ? 'left-20' : 'left-64'
      )}
    >
      <div className="flex h-full items-center justify-between px-6">
        {/* Left Side - Menu Toggle & Search */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch(toggleSidebar())}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <form onSubmit={handleSearch} className="hidden md:flex">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10 bg-white/80 border-orange-peach/30 focus:bg-white"
              />
            </div>
          </form>
        </div>

        {/* Right Side - Notifications & Profile */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-orange-deep text-white text-[10px] flex items-center justify-center">
                  3
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Thông báo</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-64 overflow-y-auto">
                <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                  <span className="font-medium">Đơn hàng mới</span>
                  <span className="text-sm text-gray-500">
                    Có 5 đơn hàng mới cần xử lý
                  </span>
                  <span className="text-xs text-orange-vivid">2 phút trước</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                  <span className="font-medium">Shop mới đăng ký</span>
                  <span className="text-sm text-gray-500">
                    Shop &quot;ABC Fashion&quot; đang chờ duyệt
                  </span>
                  <span className="text-xs text-orange-vivid">15 phút trước</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                  <span className="font-medium">Cập nhật hệ thống</span>
                  <span className="text-sm text-gray-500">
                    Phiên bản mới đã sẵn sàng
                  </span>
                  <span className="text-xs text-orange-vivid">1 giờ trước</span>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center text-primary font-medium">
                Xem tất cả thông báo
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt={user?.username} />
                  <AvatarFallback className="bg-gradient-sunrise text-white text-sm">
                    {user ? getInitials(user.username) : 'AD'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium text-gray-800">
                    {user?.username || 'Admin'}
                  </span>
                  <span className="text-xs text-gray-600">
                    {user?.role === 'ROLE_ADMIN' ? 'Quản trị viên' : 'Người bán'}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.username}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Thông tin cá nhân
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Cài đặt
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-orange-deep">
                <LogOut className="mr-2 h-4 w-4" />
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
