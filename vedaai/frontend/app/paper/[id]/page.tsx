'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Download, Printer, Loader2, AlertCircle } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import { assignmentService } from '@/services/api'
import { Assignment, Section, Question } from '@/types'

export default function PaperPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    assignmentService.getById(id)
      .then(data => setAssignment(data))
      .catch(() => setError('Failed to load paper'))
      .finally(() => setIsLoading(false))
  }, [id])

  const handleDownload = async () => {
    try {
      const blob = await assignmentService.downloadPDF(id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `question-paper-${id}.html`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch {
      alert('Download failed. Please try again.')
    }
  }

  if (isLoading) return (
    <AppLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-gray-400" />
      </div>
    </AppLayout>
  )

  if (error || !assignment?.generatedPaper) return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle size={40} className="text-red-400" />
        <p className="text-gray-600">{error || 'No paper generated yet'}</p>
        <button onClick={() => router.back()} className="btn-primary">Go Back</button>
      </div>
    </AppLayout>
  )

  const paper = assignment.generatedPaper

  return (
    <AppLayout>
      {/* Action bar */}
      <div className="sticky top-0 z-20 bg-gray-900 text-white px-4 md:px-8 py-3 flex items-center gap-3 no-print">
        <button onClick={() => router.back()} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <p className="text-xs text-gray-400">Certainly, Lalitapur! Here are customized Question Paper for your CBSE Grade 8 Science classes on the NCERT chapters:</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleDownload}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors">
            <Download size={15} /> Download PDF
          </button>
          <button onClick={() => window.print()}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors">
            <Printer size={15} /> Print
          </button>
        </div>
      </div>

      {/* Paper */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 md:p-8 max-w-3xl mx-auto"
      >
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-8 border-b-2 border-gray-900 pb-6">
            <h1 className="text-xl font-bold text-gray-900 mb-1">{paper.schoolName}</h1>
            <p className="font-semibold text-gray-800">Subject: {paper.subject}</p>
            <p className="text-gray-700">Class: {paper.className}</p>
          </div>

          {/* Meta row */}
          <div className="flex justify-between text-sm mb-4">
            <span>Time Allowed: {paper.timeAllowed}</span>
            <span>Maximum Marks: {paper.maxMarks}</span>
          </div>

          <p className="text-sm text-gray-600 mb-4 italic">{paper.generalInstructions}</p>

          {/* Name / Roll fields */}
          <div className="flex gap-8 mb-8 text-sm">
            <span>Name: <span className="inline-block w-48 border-b border-gray-400">&nbsp;</span></span>
            <span>Roll Number: <span className="inline-block w-24 border-b border-gray-400">&nbsp;</span></span>
          </div>

          {/* Sections */}
          {paper.sections.map((section: Section, si: number) => (
            <div key={si} className="mb-8">
              <h2 className="text-base font-bold text-gray-900 mb-1 underline">{section.title}</h2>
              {section.instructions && (
                <p className="text-sm text-gray-600 italic mb-4">{section.instructions}</p>
              )}
              <div className="space-y-4">
                {section.questions.map((q: Question, qi: number) => (
                  <div key={qi} className="text-sm">
                    <p className="font-medium text-gray-900 mb-1.5">
                      {qi + 1}. {q.text}
                      <span className="ml-2 text-gray-500 font-normal">({q.marks} mark{q.marks > 1 ? 's' : ''})</span>
                    </p>
                    {q.options && (
                      <div className="ml-5 grid grid-cols-2 gap-1 text-gray-700">
                        {q.options.map((opt: string, oi: number) => (
                          <p key={oi}>{String.fromCharCode(97 + oi)}) {opt}</p>
                        ))}
                      </div>
                    )}
                    {!q.options && (
                      <div className="ml-5 mt-2 space-y-1.5">
                        {[...Array(q.marks > 3 ? 5 : 3)].map((_, li) => (
                          <div key={li} className="h-5 border-b border-gray-200" />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="border-t border-gray-300 pt-4 mt-8 text-center text-sm text-gray-500 font-semibold">
            *** End of Question Paper ***
          </div>
        </div>
      </motion.div>
    </AppLayout>
  )
}
