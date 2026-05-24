import { IQuestionTypeConfig, IGeneratedPaper, ISection, IQuestion } from '../types'
import { logger } from '../utils/logger'

const scienceQs: Record<string, string[]> = {
  'Multiple Choice Questions': [
    'Which of the following is a good conductor of electricity?',
    'What is the SI unit of electric current?',
    'Which component controls current in a circuit?',
    'What happens to resistance when wire length is doubled?',
    'What is the function of a fuse in a circuit?',
    'Which device converts electrical energy to light?',
  ],
  'Short Answer': [
    "Define electric potential difference and state its SI unit.",
    "What is Ohm's Law? Write the mathematical expression.",
    "Distinguish between series and parallel circuits.",
    "Why is it dangerous to touch appliances with wet hands?",
    "Explain the heating effect of electric current.",
    "What are the factors affecting resistance of a conductor?",
  ],
  'Long Answer': [
    "Describe the construction and working of an electric motor with a labeled diagram.",
    "Explain Joule's Law of heating with derivation and applications.",
    "Compare series and parallel combinations of resistances with diagrams.",
  ],
  'True/False': [
    "Electric current flows from positive to negative terminal outside the cell.",
    "Resistance of a conductor increases with increase in temperature.",
    "A fuse wire has high resistance and low melting point.",
    "The SI unit of resistance is ohm.",
    "Insulators allow free flow of electrons through them.",
  ],
  'Fill in the Blanks': [
    "The SI unit of electric charge is ______.",
    "A device that opposes the flow of current is called ______.",
    "______ effect of current is used in electric heaters.",
    "Potential difference is measured by an instrument called ______.",
    "The wire connecting an appliance to earth is called ______ wire.",
  ],
  'Match the Following': [
    "Match the electrical components with their functions.",
    "Match the scientists with their discoveries.",
  ],
}

const mcqOpts: Record<string, string[]> = {
  'Which of the following is a good conductor of electricity?': ['Rubber', 'Copper', 'Wood', 'Plastic'],
  'What is the SI unit of electric current?': ['Volt', 'Ohm', 'Ampere', 'Watt'],
  'Which component controls current in a circuit?': ['Battery', 'Bulb', 'Rheostat', 'Switch'],
  'What happens to resistance when wire length is doubled?': ['Halved', 'Unchanged', 'Doubled', 'Quadrupled'],
  'What is the function of a fuse in a circuit?': ['Increase current', 'Store energy', 'Protect circuit', 'Generate EMF'],
  'Which device converts electrical energy to light?': ['Motor', 'Generator', 'Bulb', 'Transformer'],
}

function getSectionInstructions(type: string, marks: number): string {
  if (type === 'Multiple Choice Questions') return `Choose the correct answer. (${marks} mark each)`
  if (type === 'Short Answer') return `Answer in 2-3 sentences. (${marks} mark${marks > 1 ? 's' : ''} each)`
  if (type === 'Long Answer') return `Answer in detail with diagrams where needed. (${marks} marks each)`
  if (type === 'True/False') return `Write T for True and F for False. (${marks} mark each)`
  if (type === 'Fill in the Blanks') return `Fill in the blanks. (${marks} mark each)`
  return `(${marks} mark${marks > 1 ? 's' : ''} each)`
}

function createQuestion(type: string, index: number, marks: number): IQuestion {
  const pool = scienceQs[type] || scienceQs['Short Answer']
  const text = pool[index % pool.length]
  const difficulty: 'easy' | 'medium' | 'hard' = index % 3 === 0 ? 'hard' : index % 2 === 0 ? 'medium' : 'easy'

  if (type === 'Multiple Choice Questions') {
    const options: string[] = mcqOpts[text] || ['Option A', 'Option B', 'Option C', 'Option D']
    return { text, marks, difficulty, type, options }
  }
  return { text, marks, difficulty, type }
}

function generateDemoPaper(
  questionTypes: IQuestionTypeConfig[],
  subject: string,
  className: string,
  schoolName: string
): IGeneratedPaper {
  const totalMarks = questionTypes.reduce((s, qt) => s + qt.count * qt.marks, 0)
  const sections: ISection[] = questionTypes.map((qt, si) => {
    const questions: IQuestion[] = Array.from({ length: qt.count }, (_, i) => createQuestion(qt.type, i, qt.marks))
    return {
      title: `Section ${String.fromCharCode(65 + si)}`,
      instructions: getSectionInstructions(qt.type, qt.marks),
      questions,
    }
  })
  return {
    schoolName: schoolName || 'Delhi Public School',
    subject: subject || 'Science',
    className: className || '8th',
    timeAllowed: totalMarks <= 20 ? '45 minutes' : totalMarks <= 40 ? '90 minutes' : '3 hours',
    maxMarks: totalMarks,
    generalInstructions: 'All questions are compulsory unless stated otherwise.',
    sections,
  }
}

function getGeminiFailureMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error)

  if (message.includes('429') || message.toLowerCase().includes('quota')) {
    return 'Gemini quota exceeded for this API key/project. Check Google AI Studio billing/quota or try again after quota resets.'
  }

  if (message.includes('404') && message.includes('models/')) {
    return 'Configured Gemini model is not available for this API key. Update GEMINI_MODEL in backend/.env.'
  }

  return 'Gemini generation failed. Check the backend logs for details.'
}

async function generateWithGemini(params: {
  questionTypes: IQuestionTypeConfig[]
  subject?: string
  className?: string
  schoolName?: string
  instructions?: string
  extractedText?: string
}): Promise<IGeneratedPaper> {

  const { GoogleGenerativeAI } = await import("@google/generative-ai")

  const genAI = new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY as string
  )

  const modelName = process.env.GEMINI_MODEL?.trim() || 'gemini-2.0-flash'
  const model = genAI.getGenerativeModel({
    model: modelName
  })

  const {
    questionTypes,
    subject,
    className,
    schoolName,
    instructions,
    extractedText
  } = params

  const totalMarks = questionTypes.reduce(
    (s, qt) => s + qt.count * qt.marks,
    0
  )

  const prompt = `
Generate a complete question paper.

Return ONLY valid JSON.

School: ${schoolName || 'Delhi Public School'}
Subject: ${subject || 'Science'}
Class: ${className || '8th'}
Total Marks: ${totalMarks}

Question Types:
${questionTypes.map(qt =>
  `${qt.type}: ${qt.count} questions, ${qt.marks} marks each`
).join('; ')}

${instructions ? `Instructions: ${instructions}` : ''}

${extractedText ? `Content: ${extractedText.substring(0, 2000)}` : ''}

Return JSON format:
{
  "schoolName":"",
  "subject":"",
  "className":"",
  "timeAllowed":"",
  "maxMarks":0,
  "generalInstructions":"",
  "sections":[
    {
      "title":"",
      "instructions":"",
      "questions":[
        {
          "text":"",
          "marks":0,
          "difficulty":"easy",
          "type":"",
          "options":[]
        }
      ]
    }
  ]
}
`

  const result = await model.generateContent(prompt)

  const response = result.response.text()

  const cleaned = response
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim()

  return JSON.parse(cleaned)
}

export const generateQuestionPaper = async (params: {
  questionTypes: IQuestionTypeConfig[]
  subject?: string
  className?: string
  schoolName?: string
  instructions?: string
  extractedText?: string
}): Promise<IGeneratedPaper> => {
  const apiKey = process.env.GEMINI_API_KEY?.trim()
  if (apiKey && !apiKey.includes('placeholder')) {
    try {
      return await generateWithGemini(params)
    } catch (error) {
      logger.warn('Gemini generation failed:', error)
      throw new Error(getGeminiFailureMessage(error))
    }
  }

  logger.info('Using demo paper generation')
  return generateDemoPaper(
    params.questionTypes,
    params.subject || 'Science',
    params.className || '8th',
    params.schoolName || 'Delhi Public School'
  )
}

export const extractTextFromFile = async (filePath: string, mimeType: string): Promise<string> => {
  try {
    if (mimeType === 'application/pdf') {
      const pdfParse = await import('pdf-parse').then(m => m.default)
      const fs = await import('fs')
      const dataBuffer = fs.readFileSync(filePath)
      const data = await pdfParse(dataBuffer)
      return data.text
    }
    return ''
  } catch (error) {
    logger.warn('Text extraction failed:', error)
    return ''
  }
}
