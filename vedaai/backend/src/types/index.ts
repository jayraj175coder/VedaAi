import { Request } from 'express'
import { Document, Types } from 'mongoose'

export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    role: 'teacher' | 'admin'
    schoolId?: string
  }
}

export interface IUser extends Document {
  _id: Types.ObjectId
  name: string
  email: string
  password: string
  role: 'teacher' | 'admin'
  school?: string
  schoolId?: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

export interface IQuestionTypeConfig {
  type: string
  count: number
  marks: number
}

export interface IQuestion {
  text: string
  marks: number
  difficulty: 'easy' | 'medium' | 'hard'
  type: string
  options?: string[]
}

export interface ISection {
  title: string
  instructions?: string
  questions: IQuestion[]
}

export interface IGeneratedPaper {
  schoolName: string
  subject: string
  className: string
  timeAllowed: string
  maxMarks: number
  generalInstructions: string
  sections: ISection[]
  answerKey?: { [key: string]: string }
}

export interface IAssignment extends Document {
  _id: Types.ObjectId
  title: string
  dueDate: Date
  instructions?: string
  questionTypes: IQuestionTypeConfig[]
  fileUrl?: string
  fileName?: string
  extractedText?: string
  generatedPaper?: IGeneratedPaper
  status: 'draft' | 'generating' | 'completed' | 'failed'
  userId: Types.ObjectId
  jobId?: string
  createdAt: Date
  updatedAt: Date
}

export interface JobPayload {
  assignmentId: string
  userId: string
}
