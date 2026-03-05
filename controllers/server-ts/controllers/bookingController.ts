import { Request, Response } from 'express'
import Booking from '../models/Booking.js'
import Celebrity from '../models/Celebrity.js'
import type { AuthRequest, IUser, ICelebrity } from '../types/index.js'
import { parseBody, CreateBookingSchema, UpdateBookingStatusSchema } from '../utils/schemas.js'
import { sendBookingEmail } from '../utils/email.js'

// ── FAN: Submit booking ────────────────────────────────────────────────────────
// POST /api/bookings
export const createBooking = async (req: Request, res: Response): Promise<void> => {
  const body = parseBody(CreateBookingSchema, req.body, res)
  if (!body) return

  try {
    const celeb = await Celebrity.findOne({ _id: body.celebId, active: true })
    if (!celeb) { res.status(404).json({ message: 'Celebrity not found.' }); return }
    if (celeb.availability === 'Booked Out') {
      res.status(400).json({ message: 'This celebrity is currently booked out.' })
      return
    }

    const amount = celeb.price[body.bookingType]
    if (!amount) { res.status(400).json({ message: 'Invalid booking type.' }); return }

    const fan = (req as AuthRequest).user

    const booking = await Booking.create({
      user:          fan._id,
      celebrity:     celeb._id,
      bookingType:   body.bookingType,
      razorGoldCode: body.razorGoldCode,
      holderName:    body.holderName.toUpperCase(),
      amount,
      status:        'payment_pending',
      location:      body.location ?? '',
    })

    // Immediate confirmation email
    const result = await sendBookingEmail('booking_submitted', fan.email, {
      fanName:     `${fan.firstName} ${fan.lastName}`,
      celebName:   celeb.name,
      bookingType: body.bookingType.charAt(0).toUpperCase() + body.bookingType.slice(1),
      refCode:     booking.refCode,
      amount:   `$${amount.toLocaleString()}`,
    })

    if (result.success) {
      booking.submissionEmailSent = true
      await booking.save()
    }

    const populated = await Booking.findById(booking._id)
      .populate('celebrity', 'name image genre')

    res.status(201).json({
      booking: populated,
      message: 'Booking submitted! Check your email for confirmation.',
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: (err as Error).message })
  }
}

// ── FAN: My bookings ──────────────────────────────────────────────────────────
// GET /api/bookings/my
export const getMyBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const bookings = await Booking.find({ user: (req as AuthRequest).user._id })
      .populate('celebrity', 'name image genre category')
      .sort({ createdAt: -1 })
    res.json({ bookings })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: (err as Error).message })
  }
}

// ── ADMIN: All bookings ────────────────────────────────────────────────────────
// GET /api/admin/bookings
export const adminGetBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, search } = req.query as Record<string, string | undefined>
    const query: Record<string, unknown> = {}
    if (status && status !== 'all') query['status'] = status

    let bookings = await Booking.find(query)
      .populate<{ user: IUser }>('user', 'firstName lastName email')
      .populate<{ celebrity: ICelebrity }>('celebrity', 'name image genre')
      .sort({ createdAt: -1 })

    if (search) {
      const s = search.toLowerCase()
      bookings = bookings.filter((b) => {
        const u = b.user as IUser
        const c = b.celebrity as ICelebrity
        return (
          b.refCode.toLowerCase().includes(s) ||
          u?.email?.toLowerCase().includes(s) ||
          c?.name?.toLowerCase().includes(s) ||
          b.razorGoldCode.toLowerCase().includes(s)
        )
      })
    }

    res.json({ bookings })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: (err as Error).message })
  }
}

// ── ADMIN: Update status ──────────────────────────────────────────────────────
// PATCH /api/admin/bookings/:id/status
export const updateBookingStatus = async (req: Request, res: Response): Promise<void> => {
  const body = parseBody(UpdateBookingStatusSchema, req.body, res)
  if (!body) return

  try {
    const booking = await Booking.findById(req.params['id'])
      .populate<{ celebrity: ICelebrity }>('celebrity', 'name genre')
      .populate<{ user: IUser }>('user', 'firstName lastName email')

    if (!booking) { res.status(404).json({ message: 'Booking not found.' }); return }

    booking.status = body.status
    if (body.adminNote)    booking.adminNote    = body.adminNote
    if (body.scheduledDate) booking.scheduledDate = body.scheduledDate
    if (body.location)     booking.location     = body.location
    await booking.save()

    const fan   = booking.user   as IUser
    const celeb = booking.celebrity as ICelebrity

    const emailResult = await sendBookingEmail(
      body.status === 'approved' ? 'booking_approved' : 'booking_failed',
      fan.email,
      {
        fanName:       `${fan.firstName} ${fan.lastName}`,
        celebName:     celeb.name,
        bookingType:   booking.bookingType.charAt(0).toUpperCase() + booking.bookingType.slice(1),
        refCode:       booking.refCode,
        amount:     `$${booking.amount.toLocaleString()}`,
        adminNote:     body.adminNote,
        scheduledDate: body.scheduledDate,
        location:      body.location ?? '',
      },
    )

    if (emailResult.success) {
      booking.statusUpdateEmailSent = true
      await booking.save()
    }

    res.json({ booking, emailSent: emailResult.success })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: (err as Error).message })
  }
}
