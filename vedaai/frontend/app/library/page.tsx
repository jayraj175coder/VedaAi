'use client'
import AppLayout from '@/components/layout/AppLayout'
import Navbar from '@/components/layout/Navbar'
import { Construction } from 'lucide-react'
export default function Page() {
  return (
    <AppLayout>
      <Navbar title="My Library" />
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Construction size={40} className="text-gray-300" />
        <p className="text-gray-500 font-semibold">My Library</p>
        <p className="text-sm text-gray-400">Coming soon</p>
      </div>
    </AppLayout>
  )
}
