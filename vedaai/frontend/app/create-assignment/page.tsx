'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { ArrowLeft, ArrowRight, Upload, X, Plus, Minus, ChevronDown, Calendar, Loader2 } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import { assignmentService } from '@/services/api'
import { useAssignmentStore } from '@/store/assignmentStore'
import { QuestionType } from '@/types'
import { cn } from '@/utils'

const QUESTION_TYPES: QuestionType[] = [
  'Multiple Choice Questions', 'Short Answer', 'Long Answer',
  'True/False', 'Fill in the Blanks', 'Match the Following',
]

interface QTypeRow { type: QuestionType; count: number; marks: number }

export default function CreateAssignmentPage() {
  const router = useRouter()
  const { addAssignment } = useAssignmentStore()
  const [step, setStep] = useState(1)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [dueDate, setDueDate] = useState('')
  const [title, setTitle] = useState('')
  const [qTypes, setQTypes] = useState<QTypeRow[]>([
    { type: 'Multiple Choice Questions', count: 4, marks: 4 },
    { type: 'Short Answer', count: 4, marks: 4 },
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) setUploadedFile(accepted[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': ['.jpg', '.jpeg', '.png'], 'application/pdf': ['.pdf'] },
    maxSize: 10 * 1024 * 1024, multiple: false,
  })

  const updateQType = (index: number, field: keyof QTypeRow, value: any) => {
    setQTypes(prev => prev.map((q, i) => i === index ? { ...q, [field]: value } : q))
  }

  const addQType = () => {
    const used = qTypes.map(q => q.type)
    const next = QUESTION_TYPES.find(t => !used.includes(t))
    if (next) setQTypes(prev => [...prev, { type: next, count: 4, marks: 4 }])
  }

  const removeQType = (index: number) => {
    if (qTypes.length > 1) setQTypes(prev => prev.filter((_, i) => i !== index))
  }

  const totalQuestions = qTypes.reduce((s, q) => s + q.count, 0)
  const totalMarks = qTypes.reduce((s, q) => s + q.count * q.marks, 0)

  const handleSubmit = async () => {
    if (!dueDate) { setError('Please select a due date'); return }
    setError(''); setIsSubmitting(true)
    try {
      const formData = new FormData()
      if (title) formData.append('title', title)
      formData.append('dueDate', new Date(dueDate).toISOString())
      formData.append('questionTypes', JSON.stringify(qTypes))
      if (uploadedFile) formData.append('file', uploadedFile)

      const created = await assignmentService.create(formData)
      addAssignment(created)
      router.push(`/assignments/${created._id}`)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create assignment')
      setIsSubmitting(false)
    }
  }

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.push('/assignments')} className="p-2 rounded-xl hover:bg-gray-200 transition-colors">
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Create Assignment</h1>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Assignment Details</h2>
          <p className="text-sm text-gray-500 mb-5">Basic information about your assignment</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-xl mb-4">{error}</div>
          )}

          {/* Upload area */}
          <div {...getRootProps()} className={cn(
            'border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 mb-5',
            isDragActive ? 'border-gray-400 bg-gray-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          )}>
            <input {...getInputProps()} />
            {uploadedFile ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Upload size={18} className="text-green-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900">{uploadedFile.name}</p>
                  <p className="text-xs text-gray-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); setUploadedFile(null) }}
                  className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors ml-2">
                  <X size={14} className="text-gray-500" />
                </button>
              </div>
            ) : (
              <>
                <Upload size={28} className="mx-auto text-gray-400 mb-3" />
                <p className="text-sm font-semibold text-gray-700 mb-1">Choose a file or drag & drop it here</p>
                <p className="text-xs text-gray-400 mb-3">JPEG, PNG, PDF, up to 10MB</p>
                <button type="button" className="text-sm font-semibold bg-white border border-gray-200 rounded-xl px-4 py-2 hover:bg-gray-50 transition-colors">
                  Browse Files
                </button>
              </>
            )}
          </div>
          <p className="text-xs text-gray-400 mb-5">Upload images of your preferred document/image</p>

          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">Assignment Title (optional)</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Quiz on Electricity" className="input-field" />
          </div>

          {/* Due Date */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">Due Date</label>
            <div className="relative">
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="input-field pr-10" />
              <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Question Types */}
          <div className="mb-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Question Type</h3>
            <div className="space-y-3">
              {qTypes.map((qt, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="relative flex-1 mr-2">
                      <select value={qt.type} onChange={e => updateQType(i, 'type', e.target.value)}
                        className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium pr-8 focus:outline-none focus:ring-2 focus:ring-gray-200">
                        {QUESTION_TYPES.map(t => (
                          <option key={t} value={t} disabled={qTypes.some((q, j) => j !== i && q.type === t)}>{t}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                    {qTypes.length > 1 && (
                      <button onClick={() => removeQType(i)} className="p-1.5 rounded-lg hover:bg-red-100 transition-colors">
                        <X size={14} className="text-red-500" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {[{ label: 'No. of Questions', field: 'count' as const }, { label: 'Marks', field: 'marks' as const }].map(({ label, field }) => (
                      <div key={field}>
                        <p className="text-xs text-gray-500 mb-2">{label}</p>
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateQType(i, field, Math.max(1, qt[field] - 1))}
                            className="w-7 h-7 rounded-lg border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-100 transition-colors">
                            <Minus size={12} />
                          </button>
                          <span className="text-sm font-semibold w-6 text-center">{qt[field]}</span>
                          <button onClick={() => updateQType(i, field, Math.min(50, qt[field] + 1))}
                            className="w-7 h-7 rounded-lg border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-100 transition-colors">
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {qTypes.length < QUESTION_TYPES.length && (
              <button onClick={addQType}
                className="mt-3 flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors">
                <div className="w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center">
                  <Plus size={12} className="text-white" />
                </div>
                Add Question Type
              </button>
            )}
          </div>

          {/* Totals */}
          <div className="flex justify-between text-sm font-semibold text-gray-700 bg-gray-50 rounded-xl px-4 py-3 mb-6">
            <span>Total Questions: <span className="text-gray-900">{totalQuestions}</span></span>
            <span>Total Marks: <span className="text-gray-900">{totalMarks}</span></span>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between">
            <button onClick={() => router.push('/assignments')}
              className="btn-secondary">
              <ArrowLeft size={15} /> Previous
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleSubmit} disabled={isSubmitting}
              className="btn-primary">
              {isSubmitting ? <><Loader2 size={15} className="animate-spin" /> Creating...</> : <>Next <ArrowRight size={15} /></>}
            </motion.button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
