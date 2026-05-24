import { Request, Response } from 'express'
import jwt, { SignOptions } from 'jsonwebtoken'
import { User } from '../models/User'
import { AuthRequest } from '../types'
import { logger } from '../utils/logger'

const generateToken = (id: string, email: string, role: string): string => {
  const secret: string = process.env.JWT_SECRET || 'fallback_secret'
  const opts: SignOptions = { expiresIn: '7d' }
  return jwt.sign({ id, email, role }, secret, opts)
}

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, school, schoolId } = req.body
    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Name, email, and password are required' }); return
    }
    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) { res.status(409).json({ success: false, message: 'Email already in use' }); return }
    const user = await User.create({ name: name.trim(), email: email.toLowerCase().trim(), password, school: school || '', schoolId: schoolId || '' })
    const token = generateToken(user._id.toString(), user.email, user.role)
    logger.info(`New user registered: ${user.email}`)
    res.status(201).json({ success: true, message: 'Registration successful', token, user: { id: user._id, name: user.name, email: user.email, role: user.role, school: user.school, schoolId: user.schoolId } })
  } catch (error: any) {
    logger.error('Register error:', error)
    if (error.code === 11000) { res.status(409).json({ success: false, message: 'Email already exists' }) }
    else { res.status(500).json({ success: false, message: 'Registration failed' }) }
  }
}

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body
    if (!email || !password) { res.status(400).json({ success: false, message: 'Email and password are required' }); return }
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password')
    if (!user) { res.status(401).json({ success: false, message: 'Invalid credentials' }); return }
    const isMatch = await user.comparePassword(password)
    if (!isMatch) { res.status(401).json({ success: false, message: 'Invalid credentials' }); return }
    const token = generateToken(user._id.toString(), user.email, user.role)
    logger.info(`User logged in: ${user.email}`)
    res.json({ success: true, message: 'Login successful', token, user: { id: user._id, name: user.name, email: user.email, role: user.role, school: user.school, schoolId: user.schoolId } })
  } catch (error) {
    logger.error('Login error:', error)
    res.status(500).json({ success: false, message: 'Login failed' })
  }
}

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id)
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return }
    res.json({ success: true, user: { id: user._id, name: user.name, email: user.email, role: user.role, school: user.school, schoolId: user.schoolId, createdAt: user.createdAt } })
  } catch (error) {
    logger.error('Get profile error:', error)
    res.status(500).json({ success: false, message: 'Failed to get profile' })
  }
}

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, school, schoolId } = req.body
    const user = await User.findByIdAndUpdate(req.user!.id, { name, school, schoolId }, { new: true, runValidators: true })
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return }
    res.json({ success: true, message: 'Profile updated', user: { id: user._id, name: user.name, email: user.email, role: user.role, school: user.school, schoolId: user.schoolId } })
  } catch (error) {
    logger.error('Update profile error:', error)
    res.status(500).json({ success: false, message: 'Failed to update profile' })
  }
}

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body
    const user = await User.findById(req.user!.id).select('+password')
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return }
    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) { res.status(400).json({ success: false, message: 'Current password is incorrect' }); return }
    user.password = newPassword
    await user.save()
    res.json({ success: true, message: 'Password changed successfully' })
  } catch (error) {
    logger.error('Change password error:', error)
    res.status(500).json({ success: false, message: 'Failed to change password' })
  }
}
