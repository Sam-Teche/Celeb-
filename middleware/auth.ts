import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import type { AuthRequest, AdminRequest } from '../types/index.js'

interface JwtUserPayload {
  id: string
  iat: number
  exp: number
}

interface JwtAdminPayload {
  role: string
  name: string
  iat: number
  exp: number
}

// ── Protect user routes ───────────────────────────────────────────────────────
export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      res.status(401).json({ message: 'Not authenticated.' })
      return
    }

    const decoded = jwt.verify(token, process.env['JWT_SECRET'] as string) as JwtUserPayload
    const user = await User.findById(decoded.id)
    if (!user) {
      res.status(401).json({ message: 'User not found.' })
      return
    }
    if (user.status === 'banned') {
      res.status(403).json({ message: 'Account suspended.' })
      return
    }

    (req as AuthRequest).user = user as unknown as IUser
    next()
  } catch {
    res.status(401).json({ message: 'Invalid or expired token.' })
  }
}

// ── Protect admin routes ──────────────────────────────────────────────────────
export const adminProtect = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      res.status(401).json({ message: 'Admin access required.' })
      return
    }

    const decoded = jwt.verify(token, process.env['ADMIN_JWT_SECRET'] as string) as JwtAdminPayload
    if (decoded.role !== 'superadmin') {
      res.status(403).json({ message: 'Forbidden.' })
      return
    }

    (req as AdminRequest).admin = decoded
    next()
  } catch {
    res.status(401).json({ message: 'Invalid or expired admin token.' })
  }
}
