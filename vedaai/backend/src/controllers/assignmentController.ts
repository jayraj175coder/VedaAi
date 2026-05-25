import { Response } from 'express'
import { Assignment } from '../models/Assignment'
import { AuthRequest } from '../types'
import { logger } from '../utils/logger'
import { generateQuestionPaper, extractTextFromFile } from '../services/aiService'
import path from 'path'
import fs from 'fs'

export const getAssignments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const search = req.query.search as string || ''
    const status = req.query.status as string || ''

    const query: any = { userId: req.user!.id }
    if (search) query.title = { $regex: search, $options: 'i' }
    if (status) query.status = status

    const [assignments, total] = await Promise.all([
      Assignment.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Assignment.countDocuments(query),
    ])

    res.json({
      success: true,
      data: assignments,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    logger.error('Get assignments error:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch assignments' })
  }
}

export const getAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const assignment = await Assignment.findOne({
      _id: req.params.id,
      userId: req.user!.id,
    })

    if (!assignment) {
      res.status(404).json({ success: false, message: 'Assignment not found' })
      return
    }

    res.json({ success: true, data: assignment })
  } catch (error) {
    logger.error('Get assignment error:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch assignment' })
  }
}

export const createAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, dueDate, instructions, questionTypes } = req.body
    const file = req.file

    let parsedQuestionTypes = questionTypes
    if (typeof questionTypes === 'string') {
      try {
        parsedQuestionTypes = JSON.parse(questionTypes)
      } catch {
        res.status(400).json({ success: false, message: 'Invalid questionTypes format' })
        return
      }
    }

    if (!dueDate) {
      res.status(400).json({ success: false, message: 'Due date is required' })
      return
    }

    if (!parsedQuestionTypes || !Array.isArray(parsedQuestionTypes) || parsedQuestionTypes.length === 0) {
      res.status(400).json({ success: false, message: 'At least one question type is required' })
      return
    }

    // Extract text from uploaded file if present
    let extractedText = ''
    let fileUrl = ''
    let fileName = ''

    if (file) {
      fileUrl = `/uploads/${file.filename}`
      fileName = file.originalname
      extractedText = await extractTextFromFile(file.path, file.mimetype)
    }

    const assignmentTitle = title || (fileName ? fileName.replace(/\.[^/.]+$/, '') : 'New Assignment')

    const assignment = await Assignment.create({
      title: assignmentTitle,
      dueDate: new Date(dueDate),
      instructions: instructions || '',
      questionTypes: parsedQuestionTypes,
      fileUrl,
      fileName,
      extractedText,
      status: 'draft',
      userId: req.user!.id,
    })

    logger.info(`Assignment created: ${assignment._id} by user: ${req.user!.id}`)

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      data: assignment,
    })
  } catch (error) {
    logger.error('Create assignment error:', error)
    res.status(500).json({ success: false, message: 'Failed to create assignment' })
  }
}

export const updateAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const assignment = await Assignment.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.id },
      { $set: req.body },
      { new: true, runValidators: true }
    )

    if (!assignment) {
      res.status(404).json({ success: false, message: 'Assignment not found' })
      return
    }

    res.json({ success: true, message: 'Assignment updated', data: assignment })
  } catch (error) {
    logger.error('Update assignment error:', error)
    res.status(500).json({ success: false, message: 'Failed to update assignment' })
  }
}

export const deleteAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const assignment = await Assignment.findOneAndDelete({
      _id: req.params.id,
      userId: req.user!.id,
    })

    if (!assignment) {
      res.status(404).json({ success: false, message: 'Assignment not found' })
      return
    }

    // Delete uploaded file if exists
    if (assignment.fileUrl) {
      const filePath = path.join(process.env.UPLOAD_DIR || 'uploads', path.basename(assignment.fileUrl))
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    }

    res.json({ success: true, message: 'Assignment deleted' })
  } catch (error) {
    logger.error('Delete assignment error:', error)
    res.status(500).json({ success: false, message: 'Failed to delete assignment' })
  }
}

export const generatePaper = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const assignment = await Assignment.findOne({
      _id: req.params.id,
      userId: req.user!.id,
    })

    if (!assignment) {
      res.status(404).json({ success: false, message: 'Assignment not found' })
      return
    }

    if (assignment.status === 'generating') {
      res.status(409).json({ success: false, message: 'Paper is already being generated' })
      return
    }

    // Update status to generating
    assignment.status = 'generating'
    await assignment.save()

    // Get socket.io instance if available
    const io = (req as any).app.get('io')

    if (io) {
      io.to(`user:${req.user!.id}`).emit('generation:started', {
        assignmentId: assignment._id,
        message: 'AI is analyzing your content...',
      })
    }

    // Generate paper asynchronously
    setImmediate(async () => {
      try {
        if (io) {
          io.to(`user:${req.user!.id}`).emit('generation:progress', {
            assignmentId: assignment._id,
            progress: 30,
            message: 'Generating questions...',
          })
        }

        const paper = await generateQuestionPaper({
          questionTypes: assignment.questionTypes,
          subject: assignment.title,
          className: '8th',
          schoolName: 'Delhi Public School',
          instructions: assignment.instructions,
          extractedText: assignment.extractedText,
        })

        if (io) {
          io.to(`user:${req.user!.id}`).emit('generation:progress', {
            assignmentId: assignment._id,
            progress: 80,
            message: 'Finalizing paper...',
          })
        }

        await Assignment.findByIdAndUpdate(assignment._id, {
          generatedPaper: paper,
          status: 'completed',
        })

        if (io) {
          io.to(`user:${req.user!.id}`).emit('generation:completed', {
            assignmentId: assignment._id,
            paper,
          })
        }

        logger.info(`Paper generated for assignment: ${assignment._id}`)
      } catch (error) {
        logger.error('Paper generation failed:', error)
        const message = error instanceof Error ? error.message : 'Paper generation failed'
        await Assignment.findByIdAndUpdate(assignment._id, { status: 'failed' })
        if (io) {
          io.to(`user:${req.user!.id}`).emit('generation:failed', {
            assignmentId: assignment._id,
            message,
          })
        }
      }
    })

    res.json({
      success: true,
      message: 'Paper generation started',
      assignmentId: assignment._id,
    })
  } catch (error) {
    logger.error('Generate paper error:', error)
    res.status(500).json({ success: false, message: 'Failed to start generation' })
  }
}

export const downloadPDF = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const assignment = await Assignment.findOne({
      _id: req.params.id,
      userId: req.user!.id,
    })

    if (!assignment || !assignment.generatedPaper) {
      res.status(404).json({ success: false, message: 'Paper not found' })
      return
    }

    // Generate basic HTML that browser can print as PDF
    const paper = assignment.generatedPaper
    const html = generatePaperHTML(paper)

    res.setHeader('Content-Type', 'text/html')
    res.setHeader('Content-Disposition', `attachment; filename="question-paper-${assignment._id}.html"`)
    res.send(html)
  } catch (error) {
    logger.error('Download PDF error:', error)
    res.status(500).json({ success: false, message: 'Failed to generate PDF' })
  }
}

function generatePaperHTML(paper: any): string {
  const paperSections = Array.isArray(paper.sections) ? paper.sections : []
  const sections = paperSections.map((section: any) => {
    const sectionQuestions = Array.isArray(section.questions) ? section.questions : []
    const questions = sectionQuestions.map((q: any, qi: number) => {
      let optionsHtml = ''
      if (Array.isArray(q.options) && q.options.length > 0) {
        optionsHtml = `<div style="margin-left:20px">${q.options.map((opt: string, oi: number) =>
          `<p>${String.fromCharCode(97 + oi)}) ${opt}</p>`).join('')}</div>`
      }
      return `<div style="margin-bottom:16px"><p><strong>${qi + 1}. ${q.text}</strong> <span style="color:#666">(${q.marks} mark${q.marks > 1 ? 's' : ''})</span></p>${optionsHtml}</div>`
    }).join('')

    return `<div style="margin-bottom:32px">
      <h2 style="text-align:center">${section.title}</h2>
      ${section.instructions ? `<p style="text-align:center;font-style:italic">${section.instructions}</p>` : ''}
      ${questions}
    </div>`
  }).join('')
  const answerEntries = paper.answerKey && typeof paper.answerKey === 'object' ? Object.entries(paper.answerKey) : []
  const answerKey = answerEntries.length > 0
    ? `<div style="page-break-before:always;margin-top:40px;border-top:2px solid #111;padding-top:24px">
      <h2>Answer Key</h2>
      <p style="color:#666;font-weight:bold;text-transform:uppercase;font-size:12px">Teacher Copy</p>
      ${answerEntries.map(([questionNo, answer]) =>
        `<div style="display:grid;grid-template-columns:56px 1fr;gap:12px;margin-bottom:12px">
          <strong>${questionNo}</strong>
          <span>${answer}</span>
        </div>`
      ).join('')}
    </div>`
    : ''

  return `<!DOCTYPE html><html><head><title>Question Paper</title>
    <style>body{font-family:Arial,sans-serif;max-width:800px;margin:0 auto;padding:40px}
    @media print{body{padding:20px}}</style></head><body>
    <div style="text-align:center;margin-bottom:24px">
      <h1>${paper.schoolName}</h1>
      <p>Subject: ${paper.subject} | Class: ${paper.className}</p>
    </div>
    <div style="display:flex;justify-content:space-between;border-top:1px solid #333;border-bottom:1px solid #333;padding:8px 0;margin-bottom:16px">
      <span>Time: ${paper.timeAllowed}</span>
      <span>Maximum Marks: ${paper.maxMarks}</span>
    </div>
    <p>${paper.generalInstructions}</p>
    <div style="margin-bottom:24px">
      <p>Name: _____________________ Roll No: ____________</p>
    </div>
    ${sections}
    ${answerKey}
    </body></html>`
}
