import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import AdminSettings from '../models/AdminSettings.js'
import { parseBody, AdminLoginSchema } from '../utils/schemas.js'

// POST /api/admin/auth/login
export const adminLogin = async (req: Request, res: Response): Promise<void> => {
  const body = parseBody(AdminLoginSchema, req.body, res)
  if (!body) return

  try {
    const settings = await AdminSettings.getInstance()
    const valid = await settings.verifySuperKey(body.superKey)
    if (!valid) {
      res.status(401).json({ message: 'Invalid super key.' })
      return
    }

    const token = jwt.sign(
      { role: 'superadmin', name: 'Super Admin' },
      process.env.ADMIN_JWT_SECRET,
      { expiresIn: '12h' },
    )

    res.json({ token, admin: { name: 'Super Admin', role: 'superadmin' } })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: (err as Error).message })
  }
}
