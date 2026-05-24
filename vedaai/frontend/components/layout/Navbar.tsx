'use client'
import { Bell, ChevronDown, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { getInitials } from '@/utils'

interface NavbarProps {
  title?: string
  showBack?: boolean
}

export default function Navbar({ title = 'Assignment', showBack = false }: NavbarProps) {
  const router = useRouter()
  const { user } = useAuthStore()

  return (
    <header className="hidden md:flex sticky top-0 z-20 bg-white/80 backdrop-blur-sm border-b border-gray-100 px-6 py-3.5 items-center justify-between">
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={() => router.back()}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={18} className="text-gray-600" />
          </button>
        )}
        <span className="text-sm font-medium text-gray-500">{title}</span>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <Bell size={20} className="text-gray-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full" />
        </button>
        <button className="flex items-center gap-2 hover:bg-gray-100 rounded-xl px-3 py-2 transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              {user ? getInitials(user.name) : 'U'}
            </span>
          </div>
          <span className="text-sm font-medium text-gray-700">{user?.name || 'User'}</span>
          <ChevronDown size={14} className="text-gray-400" />
        </button>
      </div>
    </header>
  )
}
