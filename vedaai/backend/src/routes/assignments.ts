import { Router } from 'express'
import {
  getAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  generatePaper,
  downloadPDF,
} from '../controllers/assignmentController'
import { authenticate } from '../middleware/auth'
import { upload } from '../middleware/upload'

const router = Router()

// All assignment routes require authentication
router.use(authenticate)

router.get('/', getAssignments)
router.get('/:id', getAssignment)
router.post('/', upload.single('file'), createAssignment)
router.put('/:id', updateAssignment)
router.delete('/:id', deleteAssignment)
router.post('/:id/generate', generatePaper)
router.get('/:id/pdf', downloadPDF)

export default router
