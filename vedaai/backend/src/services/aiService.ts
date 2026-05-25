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

const demoAnswers: Record<string, string> = {
  'Which of the following is a good conductor of electricity?': 'Copper',
  'What is the SI unit of electric current?': 'Ampere',
  'Which component controls current in a circuit?': 'Rheostat',
  'What happens to resistance when wire length is doubled?': 'Doubled',
  'What is the function of a fuse in a circuit?': 'Protect circuit',
  'Which device converts electrical energy to light?': 'Bulb',
  'Define electric potential difference and state its SI unit.': 'Electric potential difference is the work done to move a unit charge between two points. Its SI unit is volt.',
  "What is Ohm's Law? Write the mathematical expression.": 'Ohm\'s Law states that current through a conductor is directly proportional to the potential difference across it, if temperature remains constant. V = IR.',
  'Distinguish between series and parallel circuits.': 'In series, components share one path and the same current flows through all. In parallel, components have separate paths and the same voltage appears across each branch.',
  'Why is it dangerous to touch appliances with wet hands?': 'Wet hands reduce body resistance and allow more current to pass through the body, increasing the risk of electric shock.',
  'Explain the heating effect of electric current.': 'When current flows through resistance, electrical energy converts into heat energy. This is called the heating effect of electric current.',
  'What are the factors affecting resistance of a conductor?': 'Resistance depends on length, area of cross-section, material, and temperature of the conductor.',
  'Describe the construction and working of an electric motor with a labeled diagram.': 'A correct answer should describe coil, magnetic field, split-ring commutator, brushes, and rotation due to force on a current-carrying conductor.',
  "Explain Joule's Law of heating with derivation and applications.": 'Joule\'s Law states H = I^2Rt. A correct answer should derive it from electrical power and mention uses such as heaters, irons, and fuses.',
  'Compare series and parallel combinations of resistances with diagrams.': 'A correct answer should compare equivalent resistance, current, voltage, advantages, and include neat circuit diagrams.',
  'Electric current flows from positive to negative terminal outside the cell.': 'True',
  'Resistance of a conductor increases with increase in temperature.': 'True',
  'A fuse wire has high resistance and low melting point.': 'True',
  'The SI unit of resistance is ohm.': 'True',
  'Insulators allow free flow of electrons through them.': 'False',
  'The SI unit of electric charge is ______.': 'coulomb',
  'A device that opposes the flow of current is called ______.': 'resistor',
  '______ effect of current is used in electric heaters.': 'Heating',
  'Potential difference is measured by an instrument called ______.': 'voltmeter',
  'The wire connecting an appliance to earth is called ______ wire.': 'earth',
  'Match the electrical components with their functions.': 'Battery - source of electrical energy; switch - opens or closes circuit; bulb - converts electrical energy to light; fuse - protects circuit.',
  'Match the scientists with their discoveries.': 'Ohm - relation between voltage, current, and resistance; Joule - heating effect of current; Faraday - electromagnetic induction.',
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
  const answerKey = sections.reduce<Record<string, string>>((answers, section, sectionIndex) => {
    section.questions.forEach((question, questionIndex) => {
      const key = `${String.fromCharCode(65 + sectionIndex)}${questionIndex + 1}`
      answers[key] = demoAnswers[question.text] || 'Teacher discretion'
    })
    return answers
  }, {})

  return {
    schoolName: schoolName || 'Delhi Public School',
    subject: subject || 'Science',
    className: className || '8th',
    timeAllowed: totalMarks <= 20 ? '45 minutes' : totalMarks <= 40 ? '90 minutes' : '3 hours',
    maxMarks: totalMarks,
    generalInstructions: 'All questions are compulsory unless stated otherwise.',
    sections,
    answerKey,
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

  const modelName = process.env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash-lite'
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
  ],
  "answerKey": {
    "A1": "Correct answer or expected marking point",
    "A2": "Correct answer or expected marking point"
  }
}

Answer key rules:
- Include one answer for every generated question.
- Use keys in section/question format: A1, A2, B1, B2.
- For long answers, provide concise expected marking points.
- For MCQs, provide the exact correct option text.
`

  const result = await model.generateContent(prompt)

  const response = result.response.text()

  const cleaned = response
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim()

  const parsed = JSON.parse(cleaned)
  const sections = Array.isArray(parsed.sections)
    ? parsed.sections.map((section: any, sectionIndex: number) => ({
      title: section?.title || `Section ${String.fromCharCode(65 + sectionIndex)}`,
      instructions: section?.instructions || '',
      questions: Array.isArray(section?.questions)
        ? section.questions.map((question: any) => ({
          text: question?.text || '',
          marks: Number(question?.marks) || 1,
          difficulty: ['easy', 'medium', 'hard'].includes(question?.difficulty) ? question.difficulty : 'medium',
          type: question?.type || 'Short Answer',
          options: Array.isArray(question?.options) ? question.options : undefined,
        }))
        : [],
    }))
    : []

  return {
    schoolName: parsed.schoolName || schoolName || 'Delhi Public School',
    subject: parsed.subject || subject || 'Science',
    className: parsed.className || className || '8th',
    timeAllowed: parsed.timeAllowed || (totalMarks <= 20 ? '45 minutes' : totalMarks <= 40 ? '90 minutes' : '3 hours'),
    maxMarks: Number(parsed.maxMarks) || totalMarks,
    generalInstructions: parsed.generalInstructions || 'All questions are compulsory unless stated otherwise.',
    sections,
    answerKey: parsed.answerKey && typeof parsed.answerKey === 'object' ? parsed.answerKey : undefined,
  }
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
