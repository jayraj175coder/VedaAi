'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'
import MobileHeader from './MobileHeader'
import { useAuthStore } from '@/store/authStore'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F4F4F4] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F4F4F4]">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <MobileHeader />
      <div className="md:ml-[280px] min-h-screen pb-20 md:pb-0">
        {children}
      </div>
      <MobileNav />
    </div>
  )
}
