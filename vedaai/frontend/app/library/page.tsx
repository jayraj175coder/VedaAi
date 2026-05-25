'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  Calendar,
  Download,
  FileCheck2,
  FileClock,
  FileText,
  FolderOpen,
  Loader2,
  Plus,
  Search,
  Sparkles,
} from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import Navbar from '@/components/layout/Navbar'
import { assignmentService } from '@/services/api'
import { Assignment } from '@/types'
import { cn, formatDateLong } from '@/utils'

type LibraryTab = 'all' | 'completed' | 'draft' | 'generating' | 'failed'

const tabs: Array<{ id: LibraryTab; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'completed', label: 'Generated' },
  { id: 'draft', label: 'Drafts' },
  { id: 'generating', label: 'Running' },
  { id: 'failed', label: 'Failed' },
]

const statusStyles: Record<Assignment['status'], string> = {
  completed: 'badge-completed',
  draft: 'badge-draft',
  generating: 'badge-generating',
  failed: 'badge-failed',
}

const demoLibrary: Assignment[] = [
  {
    _id: 'demo-library-1',
    title: 'Science - Electricity Question Paper',
    dueDate: '2026-06-12',
    createdAt: '2026-05-18',
    status: 'completed',
    generatedPaper: {
      schoolName: 'Delhi Public School',
      subject: 'Science',
      className: '8th',
      timeAllowed: '90 minutes',
      maxMarks: 40,
      generalInstructions: 'All questions are compulsory.',
      sections: [],
      answerKey: { A1: 'Copper', A2: 'Ampere' },
    },
  },
  {
    _id: 'demo-library-2',
    title: 'Mathematics - Algebra Basics',
    dueDate: '2026-06-20',
    createdAt: '2026-05-20',
    status: 'draft',
  },
  {
    _id: 'demo-library-3',
    title: 'History - World War II Short Test',
    dueDate: '2026-06-24',
    createdAt: '2026-05-21',
    status: 'completed',
    generatedPaper: {
      schoolName: 'Delhi Public School',
      subject: 'History',
      className: '8th',
      timeAllowed: '45 minutes',
      maxMarks: 20,
      generalInstructions: 'Answer all questions.',
      sections: [],
    },
  },
]

function getQuestionCount(assignment: Assignment) {
  const sections = Array.isArray(assignment.generatedPaper?.sections) ? assignment.generatedPaper.sections : []
  const questionTypes = Array.isArray(assignment.questionTypes) ? assignment.questionTypes : []

  return sections.reduce((total, section) => {
    const questions = Array.isArray(section.questions) ? section.questions : []
    return total + questions.length
  }, 0)
    || questionTypes.reduce((total, questionType) => total + questionType.count, 0)
    || 0
}

function getMarks(assignment: Assignment) {
  const questionTypes = Array.isArray(assignment.questionTypes) ? assignment.questionTypes : []

  return assignment.generatedPaper?.maxMarks
    || questionTypes.reduce((total, questionType) => total + questionType.count * questionType.marks, 0)
    || 0
}

export default function LibraryPage() {
  const router = useRouter()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState<LibraryTab>('all')
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const loadLibrary = useCallback(async () => {
    try {
      const res = await assignmentService.getAll()
      setAssignments(res.data || [])
      setError('')
    } catch {
      setAssignments(demoLibrary)
      setError('Showing sample library because the API is unavailable.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadLibrary()
  }, [loadLibrary])

  const stats = useMemo(() => {
    const completed = assignments.filter((assignment) => assignment.status === 'completed').length
    const drafts = assignments.filter((assignment) => assignment.status === 'draft').length
    const totalQuestions = assignments.reduce((total, assignment) => total + getQuestionCount(assignment), 0)
    const answerKeys = assignments.filter((assignment) => assignment.generatedPaper?.answerKey).length

    return [
      { label: 'Saved items', value: assignments.length, icon: FolderOpen },
      { label: 'Generated papers', value: completed, icon: FileCheck2 },
      { label: 'Drafts', value: drafts, icon: FileClock },
      { label: 'Questions', value: totalQuestions, icon: Sparkles },
      { label: 'Answer keys', value: answerKeys, icon: FileText },
    ]
  }, [assignments])

  const filteredAssignments = useMemo(() => {
    return assignments.filter((assignment) => {
      const matchesTab = activeTab === 'all' || assignment.status === activeTab
      const matchesSearch = (assignment.title || '').toLowerCase().includes(query.toLowerCase())
      return matchesTab && matchesSearch
    })
  }, [activeTab, assignments, query])

  const handleDownload = async (assignment: Assignment) => {
    setDownloadingId(assignment._id)
    try {
      const blob = await assignmentService.downloadPDF(assignment._id)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `question-paper-${assignment._id}.html`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch {
      setError('Download failed. Open the paper and try printing it from there.')
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <AppLayout>
      <Navbar title="My Library" />
      <div className="p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center">
                <FolderOpen size={18} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">My Library</h1>
            </div>
            <p className="text-sm text-gray-500 max-w-xl">
              Find generated question papers, drafts, answer keys, and reusable classroom material in one place.
            </p>
          </div>
          <Link href="/create-assignment">
            <button className="btn-primary w-full md:w-auto justify-center">
              <Plus size={16} />
              New Assignment
            </button>
          </Link>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 text-sm p-3 rounded-xl mb-4">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white border border-gray-100 rounded-2xl p-4">
              <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
                <stat.icon size={17} className="text-gray-700" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search library"
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
            />
          </div>
          <div className="flex overflow-x-auto gap-2 pb-1 lg:pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap border transition-colors',
                  activeTab === tab.id
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="h-44 rounded-2xl bg-white border border-gray-100 animate-pulse" />
            ))}
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl min-h-[320px] flex flex-col items-center justify-center text-center p-8">
            <FolderOpen size={42} className="text-gray-300 mb-4" />
            <h2 className="font-bold text-gray-900 mb-1">No library items found</h2>
            <p className="text-sm text-gray-500 max-w-sm mb-5">
              Create an assignment or generate a question paper, and it will appear here automatically.
            </p>
            <Link href="/create-assignment">
              <button className="btn-primary">
                <Plus size={16} />
                Create Assignment
              </button>
            </Link>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 xl:grid-cols-2 gap-4"
          >
            {filteredAssignments.map((assignment) => {
              const questionCount = getQuestionCount(assignment)
              const marks = getMarks(assignment)
              const hasPaper = assignment.status === 'completed' && assignment.generatedPaper
              const hasAnswerKey = Boolean(
                assignment.generatedPaper?.answerKey && Object.keys(assignment.generatedPaper.answerKey).length > 0
              )

              return (
                <motion.div
                  key={assignment._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                        {hasPaper ? <FileCheck2 size={18} className="text-green-600" /> : <FileText size={18} className="text-gray-600" />}
                      </div>
                      <div className="min-w-0">
                        <h2 className="font-bold text-gray-900 leading-snug truncate">{assignment.title || 'Untitled assignment'}</h2>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                          <Calendar size={13} />
                          <span>Due {assignment.dueDate ? formatDateLong(assignment.dueDate) : 'Not set'}</span>
                        </div>
                      </div>
                    </div>
                    <span className={cn(statusStyles[assignment.status], 'capitalize flex-shrink-0')}>
                      {assignment.status === 'generating' && <Loader2 size={10} className="inline mr-1 animate-spin" />}
                      {assignment.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-lg font-bold text-gray-900">{questionCount}</p>
                      <p className="text-xs text-gray-500">Questions</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-lg font-bold text-gray-900">{marks}</p>
                      <p className="text-xs text-gray-500">Marks</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-lg font-bold text-gray-900">{hasAnswerKey ? 'Yes' : 'No'}</p>
                      <p className="text-xs text-gray-500">Answer key</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {hasPaper ? (
                      <>
                        <button
                          onClick={() => router.push(`/paper/${assignment._id}`)}
                          className="btn-primary"
                        >
                          <FileText size={15} />
                          View Paper
                        </button>
                        <button
                          onClick={() => handleDownload(assignment)}
                          disabled={downloadingId === assignment._id}
                          className="btn-secondary"
                        >
                          {downloadingId === assignment._id ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                          Download
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => router.push(`/assignments/${assignment._id}`)}
                        className="btn-secondary"
                      >
                        <FileClock size={15} />
                        Continue
                      </button>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </div>
    </AppLayout>
  )
}
