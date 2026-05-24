'use client'
import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Filter, Search, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import Navbar from '@/components/layout/Navbar'
import AssignmentCard from '@/components/assignments/AssignmentCard'
import EmptyAssignments from '@/components/assignments/EmptyAssignments'
import { useAssignmentStore } from '@/store/assignmentStore'
import { assignmentService } from '@/services/api'
import Link from 'next/link'

const ITEMS_PER_PAGE = 6

const DEMO_ASSIGNMENTS = [
  { _id: '1', title: 'Quiz on Electricity', dueDate: '2025-06-21', createdAt: '2025-06-15', status: 'completed' as const },
  { _id: '2', title: 'Chemistry - Chemical Reactions', dueDate: '2025-07-15', createdAt: '2025-06-18', status: 'completed' as const },
  { _id: '3', title: 'Mathematics - Algebra Basics', dueDate: '2025-08-10', createdAt: '2025-06-20', status: 'draft' as const },
  { _id: '4', title: 'English Grammar Test', dueDate: '2025-06-28', createdAt: '2025-06-20', status: 'completed' as const },
  { _id: '5', title: 'Biology - Cell Structure', dueDate: '2025-07-05', createdAt: '2025-06-21', status: 'completed' as const },
  { _id: '6', title: 'History - World War II', dueDate: '2025-07-20', createdAt: '2025-06-22', status: 'draft' as const },
  { _id: '7', title: 'Physics - Motion & Forces', dueDate: '2025-07-30', createdAt: '2025-06-23', status: 'completed' as const },
  { _id: '8', title: 'Geography - Climate Zones', dueDate: '2025-08-05', createdAt: '2025-06-24', status: 'generating' as const },
]

export default function AssignmentsPage() {
  const { assignments, setAssignments, removeAssignment, searchQuery, setSearchQuery } = useAssignmentStore()
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)

  const loadAssignments = useCallback(async () => {
    try {
      const res = await assignmentService.getAll()
      setAssignments(res.data || [])
    } catch {
      setAssignments(DEMO_ASSIGNMENTS)
    } finally {
      setIsLoading(false)
    }
  }, [setAssignments])

  useEffect(() => {
    loadAssignments()
  }, [loadAssignments])

  const handleDelete = async (id: string) => {
    try { await assignmentService.delete(id) } catch {}
    removeAssignment(id)
  }

  const filtered = assignments.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  useEffect(() => { setPage(1) }, [searchQuery])

  return (
    <AppLayout>
      <Navbar title="Assignments" />
      <div className="p-4 md:p-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card p-5 h-24 animate-pulse bg-gray-100 rounded-2xl" />
            ))}
          </div>
        ) : assignments.length === 0 ? (
          <EmptyAssignments />
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
                <p className="text-sm text-gray-500">Manage and create assignments for your classes.</p>
              </div>
            </div>

            {/* Filter & Search */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-500 cursor-pointer hover:border-gray-300 transition-colors">
                <Filter size={15} />
                <span>Filter By</span>
              </div>
              <div className="flex-1 relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search Assignment"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
                />
              </div>
            </div>

            {/* Grid */}
            <AnimatePresence mode="wait">
              <motion.div
                key={page + searchQuery}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
              >
                {paginated.map((assignment) => (
                  <AssignmentCard key={assignment._id} assignment={assignment} onDelete={handleDelete} />
                ))}
                {paginated.length === 0 && (
                  <div className="col-span-2 text-center py-12 text-gray-500">
                    No assignments match your search.
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Pagination */}
            <div className="hidden md:flex items-center justify-between">
              <p className="text-sm text-gray-500">{filtered.length} assignment{filtered.length !== 1 ? 's' : ''}</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="bg-gray-900 text-white text-sm font-semibold px-5 py-2 rounded-full flex items-center gap-3">
                  <span className="text-gray-400">{page}/{totalPages}</span>
                  <Link href="/create-assignment">
                    <button className="flex items-center gap-1.5 hover:text-orange-400 transition-colors">
                      <Plus size={15} /> Create Assignment
                    </button>
                  </Link>
                </div>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Mobile FAB */}
            <Link href="/create-assignment" className="md:hidden">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="fixed bottom-24 right-5 w-14 h-14 bg-gray-900 rounded-full shadow-floating flex items-center justify-center z-40"
              >
                <Plus size={24} className="text-white" />
              </motion.button>
            </Link>
          </>
        )}
      </div>
    </AppLayout>
  )
}
