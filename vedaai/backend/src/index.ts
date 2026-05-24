import 'dotenv/config'
import express from 'express'
import http from 'http'
import { Server as SocketServer } from 'socket.io'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import path from 'path'
import fs from 'fs'

import { connectDB } from './config/database'
import { checkRedis } from './config/redis'
import { logger } from './utils/logger'
import { errorHandler, notFound } from './middleware/errorHandler'

import authRoutes from './routes/auth'
import assignmentRoutes from './routes/assignments'

const app = express()
const server = http.createServer(app)

// Socket.io setup
const io = new SocketServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

app.set('io', io)

// Security middleware
app.use(helmet({ crossOriginEmbedderPolicy: false }))

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later' },
})
app.use('/api', limiter)

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'))
}

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_DIR || 'uploads'
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Ensure logs directory exists
if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs', { recursive: true })
}

// Static files
app.use('/uploads', express.static(path.join(process.cwd(), uploadDir)))

// Health check
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/assignments', assignmentRoutes)

// Socket.io connection handling
io.on('connection', (socket) => {
  logger.debug(`Socket connected: ${socket.id}`)

  socket.on('join:user', (userId: string) => {
    socket.join(`user:${userId}`)
    logger.debug(`Socket ${socket.id} joined room user:${userId}`)
  })

  socket.on('disconnect', () => {
    logger.debug(`Socket disconnected: ${socket.id}`)
  })
})

// Error handlers
app.use(notFound)
app.use(errorHandler)

// Start server
const PORT = parseInt(process.env.PORT || '5000')

const startServer = async () => {
  try {
    await connectDB()
    await checkRedis()

    server.listen(PORT, () => {
      logger.info(`🚀 VedaAI Backend running on port ${PORT}`)
      logger.info(`📊 Environment: ${process.env.NODE_ENV}`)
      logger.info(`🔗 API URL: http://localhost:${PORT}/api`)
    })
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()

export { app, server, io }
