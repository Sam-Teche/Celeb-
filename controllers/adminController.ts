import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import Celebrity from '../models/Celebrity.js'
import Booking from '../models/Booking.js'
import AdminSettings from '../models/AdminSettings.js'
import EmailTemplate from '../models/EmailTemplate.js'
import {
  parseBody,
  UpdatePlatformSchema,
  UpdateNotificationsSchema,
  UpdatePricingSchema,
  UpdateSuperKeySchema,
  UpdateUserStatusSchema,
  UpdateUserMembershipSchema,
  UpdateEmailTemplateSchema,
} from '../utils/schemas.js'

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const getDashboard = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [totalCelebs, activeCelebs, totalBookings, pendingBookings, totalUsers, recentBookings] =
      await Promise.all([
        Celebrity.countDocuments(),
        Celebrity.countDocuments({ active: true }),
        Booking.countDocuments(),
        Booking.countDocuments({ status: 'payment_pending' }),
        User.countDocuments(),
        Booking.find()
          .sort({ createdAt: -1 })
          .limit(8)
          .populate('celebrity', 'name image')
          .populate('user', 'firstName lastName email'),
      ])

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const newUsersToday = await User.countDocuments({ createdAt: { $gte: today } })

    // Last 7 days chart
    const chartData: { day: string; bookings: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setHours(0, 0, 0, 0)
      d.setDate(d.getDate() - i)
      const next = new Date(d)
      next.setDate(next.getDate() + 1)
      const count = await Booking.countDocuments({ createdAt: { $gte: d, $lt: next } })
      chartData.push({ day: d.toLocaleDateString('en-US', { weekday: 'short' }), bookings: count })
    }

    res.json({
      stats: { totalCelebs, activeCelebs, totalBookings, pendingBookings, totalUsers, newUsersToday },
      chartData,
      recentBookings,
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: (err as Error).message })
  }
}

// ── Users ─────────────────────────────────────────────────────────────────────
export const getUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().sort({ createdAt: -1 })
    const withCounts = await Promise.all(
      users.map(async (u) => ({
        ...u.toSafeObject(),
        bookings: await Booking.countDocuments({ user: u._id }),
      })),
    )
    res.json({ users: withCounts })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: (err as Error).message })
  }
}

export const updateUserStatus = async (req: Request, res: Response): Promise<void> => {
  const body = parseBody(UpdateUserStatusSchema, req.body, res)
  if (!body) return
  try {
    const user = await User.findByIdAndUpdate(req.params['id'], { status: body.status }, { new: true })
    if (!user) { res.status(404).json({ message: 'User not found.' }); return }
    res.json({ user: user.toSafeObject() })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: (err as Error).message })
  }
}

export const updateUserMembership = async (req: Request, res: Response): Promise<void> => {
  const body = parseBody(UpdateUserMembershipSchema, req.body, res)
  if (!body) return
  try {
    const user = await User.findByIdAndUpdate(req.params['id'], { membership: body.membership }, { new: true })
    if (!user) { res.status(404).json({ message: 'User not found.' }); return }
    res.json({ user: user.toSafeObject() })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: (err as Error).message })
  }
}

// ── Settings ──────────────────────────────────────────────────────────────────
export const getSettings = async (_req: Request, res: Response): Promise<void> => {
  try {
    const settings = await AdminSettings.getInstance()
    res.json({ settings })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: (err as Error).message })
  }
}

export const updatePlatformSettings = async (req: Request, res: Response): Promise<void> => {
  const body = parseBody(UpdatePlatformSchema, req.body, res)
  if (!body) return
  try {
    const settings = await AdminSettings.getInstance()
    Object.assign(settings.platform, body)
    await settings.save()
    res.json({ settings })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: (err as Error).message })
  }
}

export const updateNotificationSettings = async (req: Request, res: Response): Promise<void> => {
  const body = parseBody(UpdateNotificationsSchema, req.body, res)
  if (!body) return
  try {
    const settings = await AdminSettings.getInstance()
    Object.assign(settings.notifications, body)
    await settings.save()
    res.json({ settings })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: (err as Error).message })
  }
}

export const updatePricing = async (req: Request, res: Response): Promise<void> => {
  const body = parseBody(UpdatePricingSchema, req.body, res)
  if (!body) return
  try {
    const settings = await AdminSettings.getInstance()
    Object.assign(settings.pricing, body)
    await settings.save()
    res.json({ settings })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: (err as Error).message })
  }
}

export const updateSuperKey = async (req: Request, res: Response): Promise<void> => {
  const body = parseBody(UpdateSuperKeySchema, req.body, res)
  if (!body) return
  try {
    const settings = await AdminSettings.getInstance()
    const valid = await settings.verifySuperKey(body.currentKey)
    if (!valid) { res.status(401).json({ message: 'Current super key is incorrect.' }); return }
    settings.superKeyHash = await bcrypt.hash(body.newKey, 12)
    await settings.save()
    res.json({ message: 'Super key updated successfully.' })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: (err as Error).message })
  }
}

// ── Email Templates ───────────────────────────────────────────────────────────
export const getEmailTemplates = async (_req: Request, res: Response): Promise<void> => {
  try {
    const templates = await EmailTemplate.find()
    res.json({ templates })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: (err as Error).message })
  }
}

export const updateEmailTemplate = async (req: Request, res: Response): Promise<void> => {
  const body = parseBody(UpdateEmailTemplateSchema, req.body, res)
  if (!body) return
  try {
    const template = await EmailTemplate.findOneAndUpdate(
      { key: req.params['key'] },
      body,
      { new: true },
    )
    if (!template) { res.status(404).json({ message: 'Template not found.' }); return }
    res.json({ template })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: (err as Error).message })
  }
}
