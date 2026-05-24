import mongoose, { Schema } from 'mongoose'
import { IAssignment } from '../types'

const QuestionSchema = new Schema({
  text: { type: String, required: true },
  marks: { type: Number, required: true, default: 1 },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  type: { type: String, required: true },
  options: [{ type: String }],
})

const SectionSchema = new Schema({
  title: { type: String, required: true },
  instructions: { type: String },
  questions: [QuestionSchema],
})

const GeneratedPaperSchema = new Schema({
  schoolName: { type: String, default: '' },
  subject: { type: String, default: '' },
  className: { type: String, default: '' },
  timeAllowed: { type: String, default: '45 minutes' },
  maxMarks: { type: Number, default: 0 },
  generalInstructions: { type: String, default: 'All questions are compulsory unless stated otherwise.' },
  sections: [SectionSchema],
  answerKey: { type: Schema.Types.Mixed },
})

const QuestionTypeConfigSchema = new Schema({
  type: { type: String, required: true },
  count: { type: Number, required: true, min: 1, max: 50 },
  marks: { type: Number, required: true, min: 1, max: 20 },
})

const AssignmentSchema = new Schema<IAssignment>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 200,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    instructions: {
      type: String,
      default: '',
      maxlength: 2000,
    },
    questionTypes: [QuestionTypeConfigSchema],
    fileUrl: { type: String, default: '' },
    fileName: { type: String, default: '' },
    extractedText: { type: String, default: '' },
    generatedPaper: GeneratedPaperSchema,
    status: {
      type: String,
      enum: ['draft', 'generating', 'completed', 'failed'],
      default: 'draft',
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    jobId: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

AssignmentSchema.index({ userId: 1, createdAt: -1 })
AssignmentSchema.index({ status: 1 })

export const Assignment = mongoose.model<IAssignment>('Assignment', AssignmentSchema)
