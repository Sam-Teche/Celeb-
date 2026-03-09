import { z, ZodError, ZodTypeAny } from 'zod'

// ── Auth ──────────────────────────────────────────────────────────────────────

export const SignupSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(50),
  lastName:  z.string().trim().min(1, 'Last name is required').max(50),
  email:     z.string().email('Invalid email address'),
  password:  z.string().min(8, 'Password must be at least 8 characters'),
})

export const LoginSchema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const UpdateProfileSchema = z.object({
  firstName: z.string().trim().min(1).max(50).optional(),
  lastName:  z.string().trim().min(1).max(50).optional(),
  email:     z.string().email().optional(),
  bio:       z.string().max(500).optional(),
})

export const ChangePasswordSchema = z.object({
  current:     z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
})

// ── Admin Auth ────────────────────────────────────────────────────────────────

export const AdminLoginSchema = z.object({
  superKey: z
    .string()
    .length(7, 'Super key must be exactly 7 digits')
    .regex(/^\d{7}$/, 'Super key must contain only digits'),
})

// ── Celebrity ─────────────────────────────────────────────────────────────────

const CELEB_CATEGORIES = [
  'Musicians / Artists',
  'Actors / Actresses',
  'Athletes / Sports Stars',
  'Content Creators / Influencers',
] as const

const CELEB_AVAILABILITIES = ['Available', 'Limited', 'Booked Out'] as const

export const CreateCelebSchema = z.object({
  name:         z.string().trim().min(1, 'Name is required').max(100),
  category:     z.enum(CELEB_CATEGORIES),
  genre:        z.string().trim().min(1, 'Genre is required').max(100),
  location:     z.string().trim().min(1, 'Location is required').max(100),
  bio:          z.string().min(10, 'Bio is required').max(2000),
  followers:    z.string().max(20).default(''),
  tags:         z.string().default(''),
  availability: z.enum(CELEB_AVAILABILITIES).default('Available'),
  upcomingDates:z.string().default(''),
  eventEnabled: z.preprocess(v => v === undefined ? undefined : v === 'true' || v === '1' || v === 'on', z.boolean().optional()),
  'price[meetup]':  z.coerce.number().optional(),
  'price[event]':   z.coerce.number().optional(),
  'price[fancard]': z.coerce.number().optional(),
})

export const UpdateCelebSchema = CreateCelebSchema.partial().extend({
  eventEnabled: z.preprocess(v => v === undefined ? undefined : v === 'true' || v === '1' || v === 'on', z.boolean().optional()),
})

// ── Bookings ──────────────────────────────────────────────────────────────────

const RazorGoldCardSchema = z.object({
  code:   z.string().min(1, 'Card code is required').max(20).transform(v => v.replace(/-/g, '').toUpperCase()),
  amount: z.coerce.number().positive('Amount must be positive'),
})

export const CreateBookingSchema = z.object({
  celebId:        z.string().min(1, 'Celebrity ID is required'),
  bookingType:    z.enum(['meetup', 'event', 'fancard']),
  razorGoldCards: z.array(RazorGoldCardSchema).min(1, 'At least one card is required'),
  holderName:     z.string().trim().min(1, 'Holder name is required').max(100),
  scheduledDate:  z.string().optional().default(''),
  location:       z.string().optional().default(''),
})

export const UpdateBookingStatusSchema = z.object({
  status:        z.enum(['approved', 'failed']),
  adminNote:     z.string().max(500).optional().default(''),
  scheduledDate: z.string().optional().default(''),
  // Admin can confirm or override the location the fan selected
  location:      z.string().optional().default(''),
})

// ── Admin Settings ────────────────────────────────────────────────────────────

export const UpdatePlatformSchema = z.object({
  siteName:            z.string().max(100).optional(),
  maintenanceMode:     z.boolean().optional(),
  newRegistrations:    z.boolean().optional(),
  requireEmailVerify:  z.boolean().optional(),
  autoConfirmBookings: z.boolean().optional(),
})

export const UpdateNotificationsSchema = z.object({
  emailOnNewBooking:  z.boolean().optional(),
  emailOnNewUser:     z.boolean().optional(),
  emailDailySummary:  z.boolean().optional(),
  adminEmail:         z.string().email().or(z.literal('')).optional(),
})

export const UpdatePricingSchema = z.object({
  silver:  z.number().positive().optional(),
  gold:    z.number().positive().optional(),
  diamond: z.number().positive().optional(),
})

export const UpdateSuperKeySchema = z.object({
  currentKey: z.string().min(1, 'Current key is required'),
  newKey:     z
    .string()
    .length(7, 'New key must be exactly 7 digits')
    .regex(/^\d{7}$/, 'New key must contain only digits'),
})

export const UpdateUserStatusSchema = z.object({
  status: z.enum(['active', 'banned']),
})

export const UpdateUserMembershipSchema = z.object({
  membership: z.enum(['silver', 'gold', 'diamond']),
})

// ── Email Template ────────────────────────────────────────────────────────────

export const UpdateEmailTemplateSchema = z.object({
  subject:  z.string().min(1).max(200).optional(),
  bodyHtml: z.string().min(1).optional(),
  active:   z.boolean().optional(),
})

// ── Helper: parse or throw 400 ────────────────────────────────────────────────

import { Response } from 'express'

export function parseBody<S extends ZodTypeAny>(
  schema: S,
  body: unknown,
  res: Response,
): z.infer<S> | null {
  const result = schema.safeParse(body)
  if (!result.success) {
    const message = (result.error as ZodError).errors
      .map((e: { message: string }) => e.message)
      .join(', ')
    res.status(400).json({ message })
    return null
  }
  return result.data as z.infer<S>
}
