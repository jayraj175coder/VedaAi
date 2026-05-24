'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Wand2, FileText, Loader2, AlertCircle, CheckCircle2, Clock, Calendar } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import { assignmentService } from '@/services/api'
import { Assignment } from '@/types'
import { formatDateLong, cn } from '@/utils'
import { useAssignmentStore } from '@/store/assignmentStore'
import { getSocket } from '@/services/socket'
import { useAuthStore } from '@/store/authStore'

export default function AssignmentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuthStore()
  const { updateAssignment } = useAssignmentStore()
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressMsg, setProgressMsg] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadAssignment()
  }, [id])

  useEffect(() => {
    if (!user) return
    const socket = getSocket()
    socket.emit('join:user', user.id)

    socket.on('generation:started', (data: any) => {
      if (data.assignmentId === id) { setIsGenerating(true); setProgress(10); setProgressMsg(data.message) }
    })
    socket.on('generation:progress', (data: any) => {
      if (data.assignmentId === id) { setProgress(data.progress); setProgressMsg(data.message) }
    })
    socket.on('generation:completed', (data: any) => {
      if (data.assignmentId === id) {
        setIsGenerating(false); setProgress(100)
        setAssignment(prev => prev ? { ...prev, status: 'completed', generatedPaper: data.paper } : prev)
        updateAssignment(id, { status: 'completed', generatedPaper: data.paper })
        loadAssignment()
      }
    })
    socket.on('generation:failed', (data: any) => {
      if (data.assignmentId === id) {
        setIsGenerating(false)
        setError(data.message || 'Paper generation failed. Please try again.')
        setAssignment(prev => prev ? { ...prev, status: 'failed' } : prev)
      }
    })
    return () => {
      socket.off('generation:started'); socket.off('generation:progress')
      socket.off('generation:completed'); socket.off('generation:failed')
    }
  }, [user, id])

  const loadAssignment = async () => {
    try {
      const data = await assignmentService.getById(id)
      setAssignment(data)
      if (data.status === 'generating') setIsGenerating(true)
    } catch {
      setError('Failed to load assignment')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerate = async () => {
    if (!assignment) return
    setError(''); setIsGenerating(true); setProgress(5); setProgressMsg('Starting AI generation...')
    try {
      await assignmentService.generatePaper(id)
      setAssignment(prev => prev ? { ...prev, status: 'generating' } : prev)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to start generation')
      setIsGenerating(false)
    }
  }

  if (isLoading) return (
    <AppLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-gray-400" />
      </div>
    </AppLayout>
  )

  if (!assignment) return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle size={40} className="text-red-400" />
        <p className="text-gray-600">Assignment not found</p>
        <button onClick={() => router.push('/assignments')} className="btn-primary">Back to Assignments</button>
      </div>
    </AppLayout>
  )

  const totalQuestions = assignment.questionTypes?.reduce((s, q) => s + q.count, 0) || 0
  const totalMarks = assignment.questionTypes?.reduce((s, q) => s + q.count * q.marks, 0) || 0

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.push('/assignments')} className="p-2 rounded-xl hover:bg-gray-200 transition-colors">
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{assignment.title}</h1>
            <p className="text-sm text-gray-500">Assignment Details</p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-xl mb-4">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Status card */}
        <div className="card p-5 mb-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center',
                assignment.status === 'completed' ? 'bg-green-100' :
                assignment.status === 'generating' ? 'bg-orange-100' :
                assignment.status === 'failed' ? 'bg-red-100' : 'bg-gray-100'
              )}>
                {assignment.status === 'completed' ? <CheckCircle2 size={20} className="text-green-600" /> :
                 assignment.status === 'generating' ? <Loader2 size={20} className="text-orange-600 animate-spin" /> :
                 assignment.status === 'failed' ? <AlertCircle size={20} className="text-red-600" /> :
                 <Clock size={20} className="text-gray-600" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 capitalize">{assignment.status}</p>
                <p className="text-xs text-gray-500">
                  {assignment.status === 'completed' ? 'Paper generated successfully' :
                   assignment.status === 'generating' ? (progressMsg || 'AI is generating your paper...') :
                   assignment.status === 'failed' ? 'Generation failed' : 'Ready to generate'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar size={14} />
              <span>Due: {formatDateLong(assignment.dueDate)}</span>
            </div>
          </div>

          {isGenerating && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{progressMsg || 'Generating...'}</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Question Types */}
        {assignment.questionTypes && assignment.questionTypes.length > 0 && (
          <div className="card p-5 mb-4">
            <h2 className="font-bold text-gray-900 mb-3">Question Types</h2>
            <div className="space-y-2">
              {assignment.questionTypes.map((qt, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-700">{qt.type}</span>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{qt.count} Q</span>
                    <span>{qt.marks} M each</span>
                    <span className="font-semibold text-gray-800">{qt.count * qt.marks} marks</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-3 pt-3 border-t border-gray-200">
              <span className="text-sm font-semibold text-gray-700">Total: {totalQuestions} Questions</span>
              <span className="text-sm font-semibold text-gray-700">{totalMarks} Marks</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          {assignment.status !== 'completed' && assignment.status !== 'generating' && (
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleGenerate}
              disabled={isGenerating}
              className="btn-primary flex-1"
            >
              <Wand2 size={16} className="text-orange-400" />
              Generate Question Paper
            </motion.button>
          )}

          {assignment.status === 'completed' && assignment.generatedPaper && (
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => router.push(`/paper/${id}`)}
              className="btn-primary flex-1"
            >
              <FileText size={16} />
              View Generated Paper
            </motion.button>
          )}

          {assignment.status === 'failed' && (
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleGenerate}
              className="btn-primary flex-1"
            >
              <Wand2 size={16} className="text-orange-400" />
              Retry Generation
            </motion.button>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
