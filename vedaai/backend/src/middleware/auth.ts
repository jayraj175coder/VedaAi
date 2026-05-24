import { Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AuthRequest } from '../types'
import { User } from '../models/User'

interface JwtPayload {
  id: string
  email: string
  role: 'teacher' | 'admin'
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'No token provided' })
      return
    }

    const token = authHeader.split(' ')[1]
    const secret = process.env.JWT_SECRET || 'fallback_secret'

    const decoded = jwt.verify(token, secret) as JwtPayload

    const user = await User.findById(decoded.id).select('-password')
    if (!user) {
      res.status(401).json({ success: false, message: 'User not found' })
      return
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      schoolId: user.schoolId,
    }

    next()
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ success: false, message: 'Token expired' })
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ success: false, message: 'Invalid token' })
    } else {
      res.status(500).json({ success: false, message: 'Authentication error' })
    }
  }
}

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'Insufficient permissions' })
      return
    }
    next()
  }
}
