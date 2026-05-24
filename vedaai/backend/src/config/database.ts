import mongoose from 'mongoose'
import { logger } from '../utils/logger'

export const connectDB = async (): Promise<void> => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vedaai'
    await mongoose.connect(uri)
    logger.info('MongoDB connected successfully')
  } catch (error) {
    logger.error('MongoDB connection failed:', error)
    process.exit(1)
  }
}

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect()
  logger.info('MongoDB disconnected')
}
