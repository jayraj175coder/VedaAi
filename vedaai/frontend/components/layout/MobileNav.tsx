'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, Users, FileText, BookOpen, Wand2 } from 'lucide-react'
import { cn } from '@/utils'

const mobileNav = [
  { href: '/dashboard', label: 'Home', icon: LayoutGrid },
  { href: '/groups', label: 'My Groups', icon: Users },
  { href: '/assignments', label: 'Assignments', icon: FileText },
  { href: '/library', label: 'Library', icon: BookOpen },
  { href: '/toolkit', label: 'AI Toolkit', icon: Wand2 },
]

export default function MobileNav() {
  const pathname = usePathname()
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 shadow-floating">
      <div className="flex items-center">
        {mobileNav.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/assignments'
            ? pathname.startsWith('/assignments') || pathname.startsWith('/paper') || pathname.startsWith('/create-assignment')
            : pathname === href
          return (
            <Link key={href} href={href} className="flex-1">
              <div className={cn(
                'flex flex-col items-center gap-1 py-2.5 px-1 transition-colors',
                isActive ? 'text-gray-900' : 'text-gray-400'
              )}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium leading-none">{label}</span>
              </div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
