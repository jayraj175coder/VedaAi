'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MoreVertical, Eye, Trash2, FileText, Loader2 } from 'lucide-react'
import { Assignment } from '@/types'
import { formatDate } from '@/utils'
import { useRouter } from 'next/navigation'
import { cn } from '@/utils'

interface AssignmentCardProps {
  assignment: Assignment
  onDelete: (id: string) => void
}

const statusBadge: Record<string, string> = {
  completed: 'badge-completed',
  draft: 'badge-draft',
  generating: 'badge-generating',
  failed: 'badge-failed',
}

export default function AssignmentCard({ assignment, onDelete }: AssignmentCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleCardClick = () => {
    router.push(`/assignments/${assignment._id}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="card p-5 cursor-pointer hover:shadow-md transition-all duration-200 relative"
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-2.5 flex-1 pr-2">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <FileText size={15} className="text-gray-600" />
          </div>
          <h3 className="font-bold text-gray-900 text-sm leading-snug underline underline-offset-2">
            {assignment.title}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(statusBadge[assignment.status] || 'badge-draft', 'flex-shrink-0')}>
            {assignment.status === 'generating' && (
              <Loader2 size={10} className="inline mr-1 animate-spin" />
            )}
            {assignment.status}
          </span>
          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen) }}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <MoreVertical size={16} className="text-gray-400" />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 top-8 w-44 bg-white rounded-xl shadow-dropdown border border-gray-100 py-1 z-50"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); setMenuOpen(false)
                      router.push(`/assignments/${assignment._id}`)
                    }}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Eye size={14} /> View Assignment
                  </button>
                  {assignment.status === 'completed' && assignment.generatedPaper && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); setMenuOpen(false)
                        router.push(`/paper/${assignment._id}`)
                      }}
                      className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <FileText size={14} /> View Paper
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); setMenuOpen(false)
                      onDelete(assignment._id)
                    }}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500 ml-10">
        <span>
          <span className="font-semibold text-gray-700">Assigned on</span>: {formatDate(assignment.createdAt)}
        </span>
        {assignment.dueDate && (
          <span>
            <span className="font-semibold text-gray-700">Due</span>: {formatDate(assignment.dueDate)}
          </span>
        )}
      </div>
    </motion.div>
  )
}
