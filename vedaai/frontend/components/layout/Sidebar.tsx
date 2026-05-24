'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutGrid, Users, FileText, Wand2, BookOpen, Settings, Sparkles, LogOut,
} from 'lucide-react'
import { cn, getInitials } from '@/utils'
import { useAssignmentStore } from '@/store/assignmentStore'
import { useAuthStore } from '@/store/authStore'

const navItems = [
  { href: '/dashboard', label: 'Home', icon: LayoutGrid },
  { href: '/groups', label: 'My Groups', icon: Users },
  { href: '/assignments', label: 'Assignments', icon: FileText, badge: true },
  { href: '/toolkit', label: "AI Teacher's Toolkit", icon: Wand2 },
  { href: '/library', label: 'My Library', icon: BookOpen },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { assignments } = useAssignmentStore()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-[280px] bg-white border-r border-gray-100 shadow-sidebar z-30 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <Link href="/assignments" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-lg">V</span>
          </div>
          <span className="text-xl font-bold text-gray-900">VedaAI</span>
        </Link>
      </div>

      {/* Create Button */}
      <div className="px-5 pt-5 pb-3">
        <Link href="/create-assignment">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white rounded-full py-3 text-sm font-semibold shadow-md hover:bg-gray-800 transition-all duration-200 border-2 border-orange-500"
          >
            <Sparkles size={16} className="text-orange-400" />
            Create Assignment
          </motion.button>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon, badge }) => {
          const isActive = href === '/assignments'
            ? pathname.startsWith('/assignments') || pathname.startsWith('/paper') || pathname.startsWith('/create-assignment')
            : pathname.startsWith(href)
          return (
            <Link key={href} href={href}>
              <motion.div
                whileHover={{ x: 2 }}
                className={cn('sidebar-link', isActive && 'active')}
              >
                <Icon size={18} className={isActive ? 'text-gray-900' : 'text-gray-500'} />
                <span className="flex-1">{label}</span>
                {badge && assignments.length > 0 && (
                  <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[22px] text-center">
                    {assignments.length > 99 ? '99+' : assignments.length}
                  </span>
                )}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-4 pb-4 space-y-1 border-t border-gray-100 pt-3">
        <Link href="/settings">
          <div className={cn('sidebar-link', pathname === '/settings' && 'active')}>
            <Settings size={18} className="text-gray-500" />
            <span>Settings</span>
          </div>
        </Link>
        <button onClick={handleLogout} className="sidebar-link w-full text-left text-red-500 hover:bg-red-50">
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
        {user && (
          <div className="mt-3 mx-1 p-3 bg-gray-50 rounded-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {getInitials(user.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.school || user.email}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
