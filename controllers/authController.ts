import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import type { AuthRequest } from '../types/index.js'
import {
  parseBody,
  SignupSchema,
  LoginSchema,
  UpdateProfileSchema,
  ChangePasswordSchema,
} from '../utils/schemas.js'

const signToken = (id: string): string =>
  jwt.sign({ id }, process.env['JWT_SECRET'] as string, {
    expiresIn: (process.env['JWT_EXPIRES_IN'] ?? '7d') as `${number}${'s'|'m'|'h'|'d'|'w'|'y'}` | number,
  })

// POST /api/auth/signup
export const signup = async (req: Request, res: Response): Promise<void> => {
  const body = parseBody(SignupSchema, req.body, res)
  if (!body) return

  try {
    const exists = await User.findOne({ email: body.email.toLowerCase() })
    if (exists) {
      res.status(409).json({ message: 'Email already registered.' })
      return
    }

    const user = await User.create({ ...body, provider: 'local' })
    const token = signToken(user._id.toString())
    res.status(201).json({ token, user: user.toSafeObject() })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: (err as Error).message })
  }
}

// POST /api/auth/login
export const login = async (req: Request, res: Response): Promise<void> => {
  const body = parseBody(LoginSchema, req.body, res)
  if (!body) return

  try {
    const user = await User.findOne({ email: body.email.toLowerCase() }).select('+password')
    if (!user || !(await user.comparePassword(body.password))) {
      res.status(401).json({ message: 'Invalid email or password.' })
      return
    }
    if (user.status === 'banned') {
      res.status(403).json({ message: 'Account suspended.' })
      return
    }

    const token = signToken(user._id.toString())
    res.json({ token, user: user.toSafeObject() })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: (err as Error).message })
  }
}

// PUT /api/auth/profile
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  const body = parseBody(UpdateProfileSchema, req.body, res)
  if (!body) return

  try {
    const user = await User.findByIdAndUpdate(
      (req as AuthRequest).user._id,
      body,
      { new: true, runValidators: true },
    )
    if (!user) { res.status(404).json({ message: 'User not found.' }); return }
    res.json({ user: user.toSafeObject() })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: (err as Error).message })
  }
}

// PUT /api/auth/change-password
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  const body = parseBody(ChangePasswordSchema, req.body, res)
  if (!body) return

  try {
    const user = await User.findById((req as AuthRequest).user._id).select('+password')
    if (!user) { res.status(404).json({ message: 'User not found.' }); return }
    if (!user.password) {
      res.status(400).json({ message: 'OAuth accounts cannot change password here.' })
      return
    }
    if (!(await user.comparePassword(body.current))) {
      res.status(401).json({ message: 'Current password is incorrect.' })
      return
    }

    user.password = body.newPassword
    await user.save()
    res.json({ message: 'Password updated.' })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: (err as Error).message })
  }
}

export { signToken }
