'use client'
import AppLayout from '@/components/layout/AppLayout'
import Navbar from '@/components/layout/Navbar'
import { Construction } from 'lucide-react'

export default function DashboardPage() {
  return (
    <AppLayout>
      <Navbar title="Dashboard" />
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Construction size={40} className="text-gray-300" />
        <h2 className="text-xl font-bold text-gray-700">Dashboard</h2>
        <p className="text-sm text-gray-400">Coming soon</p>
      </div>
    </AppLayout>
  )
}
