'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plus, FileX } from 'lucide-react'

export default function EmptyAssignments() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
    >
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
        <FileX size={36} className="text-gray-400" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">No assignments yet</h2>
      <p className="text-sm text-gray-500 max-w-sm mb-8">
        Create your first assignment and let AI generate a professional question paper for your students.
      </p>
      <Link href="/create-assignment">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="btn-primary px-6 py-3 text-base shadow-md"
        >
          <Plus size={18} />
          Create First Assignment
        </motion.button>
      </Link>
    </motion.div>
  )
}
