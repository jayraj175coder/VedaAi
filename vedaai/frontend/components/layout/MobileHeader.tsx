'use client'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { getInitials } from '@/utils'

export default function MobileHeader() {
  const { user } = useAuthStore()
  return (
    <header className="md:hidden sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm">
      <Link href="/assignments" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">V</span>
        </div>
        <span className="text-lg font-bold text-gray-900">VedaAI</span>
      </Link>
      <div className="flex items-center gap-2">
        <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <Bell size={20} className="text-gray-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full" />
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-xs font-bold">
          {user ? getInitials(user.name) : 'U'}
        </div>
      </div>
    </header>
  )
}
