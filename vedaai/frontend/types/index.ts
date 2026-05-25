export interface User {
  id: string
  name: string
  email: string
  role: 'teacher' | 'admin'
  school?: string
  schoolId?: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface Assignment {
  _id: string
  title: string
  dueDate: string
  createdAt: string
  updatedAt?: string
  instructions?: string
  questionTypes?: QuestionTypeConfig[]
  fileUrl?: string
  fileName?: string
  generatedPaper?: GeneratedPaper
  status: 'draft' | 'generating' | 'completed' | 'failed'
  userId?: string
}

export interface QuestionTypeConfig {
  type: string
  count: number
  marks: number
}

export interface Section {
  title: string
  instructions?: string
  questions: Question[]
}

export interface Question {
  text: string
  marks: number
  difficulty: 'easy' | 'medium' | 'hard'
  type: string
  options?: string[]
}

export interface GeneratedPaper {
  schoolName: string
  subject: string
  className: string
  timeAllowed: string
  maxMarks: number
  generalInstructions: string
  sections: Section[]
  answerKey?: Record<string, string>
}

export interface JobStatus {
  jobId: string
  status: 'waiting' | 'active' | 'completed' | 'failed'
  progress?: number
  message?: string
  assignmentId?: string
}

export type QuestionType =
  | 'Multiple Choice Questions'
  | 'Short Answer'
  | 'Long Answer'
  | 'True/False'
  | 'Fill in the Blanks'
  | 'Match the Following'

export interface ApiResponse<T = unknown> {
  success: boolean
  message?: string
  data?: T
  token?: string
  user?: User
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}
