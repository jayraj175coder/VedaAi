import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(__dirname, '../../.env') })

import { User } from '../models/User'
import { Assignment } from '../models/Assignment'

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vedaai')
  console.log('Connected to MongoDB')

  // Clear existing data
  await User.deleteMany({})
  await Assignment.deleteMany({})

  // Create admin user
  const admin = await User.create({
    name: 'Admin User',
    email: process.env.SEED_ADMIN_EMAIL || 'admin@vedaai.com',
    password: process.env.SEED_ADMIN_PASSWORD || 'Admin@123456',
    role: 'admin',
    school: 'Delhi Public School',
    schoolId: 'DPS001',
  })

  // Create teacher user
  const teacher = await User.create({
    name: 'John Doe',
    email: 'teacher@vedaai.com',
    password: 'Teacher@123456',
    role: 'teacher',
    school: 'Delhi Public School, Sector-4, Bokaro',
    schoolId: 'DPS-BKR-001',
  })

  // Create sample assignments
  const assignments = await Assignment.insertMany([
    {
      title: 'Quiz on Electricity',
      dueDate: new Date('2025-06-21'),
      instructions: 'CBSE Grade 8 Science quiz based on NCERT chapters on electricity.',
      questionTypes: [
        { type: 'Multiple Choice Questions', count: 5, marks: 1 },
        { type: 'Short Answer', count: 3, marks: 2 },
      ],
      status: 'completed',
      userId: teacher._id,
      generatedPaper: {
        schoolName: 'Delhi Public School, Sector-4, Bokaro',
        subject: 'Science',
        className: '8th',
        timeAllowed: '45 minutes',
        maxMarks: 11,
        generalInstructions: 'All questions are compulsory.',
        sections: [
          {
            title: 'Section A',
            instructions: 'Multiple Choice Questions (1 mark each)',
            questions: [
              { text: 'What is the SI unit of electric current?', marks: 1, difficulty: 'easy', type: 'MCQ', options: ['Volt', 'Ampere', 'Ohm', 'Watt'] },
              { text: 'Which of the following is a good conductor?', marks: 1, difficulty: 'easy', type: 'MCQ', options: ['Rubber', 'Wood', 'Copper', 'Plastic'] },
            ],
          },
        ],
      },
    },
    {
      title: 'Chemistry - Chemical Reactions',
      dueDate: new Date('2025-07-15'),
      instructions: 'Grade 10 Chemistry - Types of chemical reactions.',
      questionTypes: [
        { type: 'Multiple Choice Questions', count: 4, marks: 1 },
        { type: 'Short Answer', count: 4, marks: 2 },
        { type: 'Long Answer', count: 2, marks: 5 },
      ],
      status: 'completed',
      userId: teacher._id,
    },
    {
      title: 'Mathematics - Algebra',
      dueDate: new Date('2025-08-10'),
      questionTypes: [
        { type: 'Multiple Choice Questions', count: 5, marks: 1 },
        { type: 'Short Answer', count: 5, marks: 2 },
      ],
      status: 'draft',
      userId: teacher._id,
    },
  ])

  console.log('\n✅ Seed completed successfully!\n')
  console.log('Test Credentials:')
  console.log('─────────────────────────────────────')
  console.log(`Admin:   ${admin.email} / ${process.env.SEED_ADMIN_PASSWORD || 'Admin@123456'}`)
  console.log(`Teacher: teacher@vedaai.com / Teacher@123456`)
  console.log('─────────────────────────────────────')
  console.log(`\nCreated ${assignments.length} sample assignments\n`)

  await mongoose.disconnect()
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
