import { Request, Response } from 'express'
import Celebrity from '../models/Celebrity.js'
import { cloudinary } from '../config/cloudinary.js'
import { parseBody, CreateCelebSchema, UpdateCelebSchema } from '../utils/schemas.js'

// ── Helpers ───────────────────────────────────────────────────────────────────

const parsePrice = (body: Record<string, unknown>, fallback?: { meetup: number; event: number; fancard: number }) => ({
  meetup:  Number(body['price[meetup]']  ?? body?.['price']?.['meetup']  ?? fallback?.meetup  ?? 0),
  event:   Number(body['price[event]']   ?? body?.['price']?.['event']   ?? fallback?.event   ?? 0),
  fancard: Number(body['price[fancard]'] ?? body?.['price']?.['fancard'] ?? fallback?.fancard ?? 0),
})

const splitComma = (str: string | undefined): string[] =>
  str ? str.split(',').map((s) => s.trim()).filter(Boolean) : []

// ── PUBLIC ─────────────────────────────────────────────────────────────────────

// GET /api/celebs
export const getCelebs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, search } = req.query as Record<string, string | undefined>
    const query: Record<string, unknown> = { active: true }
    if (category && category !== 'All') query['category'] = category
    if (search) query['$text'] = { $search: search }

    const celebs = await Celebrity.find(query).sort({ createdAt: -1 })
    res.json({ celebs })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: (err as Error).message })
  }
}

// GET /api/celebs/:id
export const getCeleb = async (req: Request, res: Response): Promise<void> => {
  try {
    const celeb = await Celebrity.findOne({ _id: req.params['id'], active: true })
    if (!celeb) { res.status(404).json({ message: 'Celebrity not found.' }); return }
    res.json({ celeb })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: (err as Error).message })
  }
}

// ── ADMIN ──────────────────────────────────────────────────────────────────────

// GET /api/admin/celebs
export const adminGetCelebs = async (_req: Request, res: Response): Promise<void> => {
  try {
    const celebs = await Celebrity.find().sort({ createdAt: -1 })
    res.json({ celebs })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: (err as Error).message })
  }
}

// GET /api/admin/celebs/:id
export const adminGetCeleb = async (req: Request, res: Response): Promise<void> => {
  try {
    const celeb = await Celebrity.findById(req.params['id'])
    if (!celeb) { res.status(404).json({ message: 'Celebrity not found.' }); return }
    res.json({ celeb })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: (err as Error).message })
  }
}

// POST /api/admin/celebs
export const createCeleb = async (req: Request, res: Response): Promise<void> => {
  const body = parseBody(CreateCelebSchema, req.body, res)
  if (!body) return

  try {
    const file = req.file as Express.Multer.File & { path: string; filename: string } | undefined
    if (!file) { res.status(400).json({ message: 'Celebrity image is required.' }); return }

    const price = parsePrice(req.body as Record<string, unknown>)
    if (!price.meetup || !price.event || !price.fancard) {
      res.status(400).json({ message: 'All RazorGold Points values are required.' })
      return
    }

    const celeb = await Celebrity.create({
      name: body.name,
      category: body.category,
      genre: body.genre,
      location: body.location,
      bio: body.bio,
      followers: body.followers ?? '',
      tags: splitComma(body.tags),
      price,
      availability: body.availability,
      upcomingDates: parseUpcomingDates(body.upcomingDates),
      image: file.path,
      imagePublicId: file.filename,
    })

    res.status(201).json({ celeb })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: (err as Error).message })
  }
}

// PUT /api/admin/celebs/:id
export const updateCeleb = async (req: Request, res: Response): Promise<void> => {
  const body = parseBody(UpdateCelebSchema, req.body, res)
  if (!body) return

  try {
    const celeb = await Celebrity.findById(req.params['id'])
    if (!celeb) { res.status(404).json({ message: 'Celebrity not found.' }); return }

    const file = req.file as Express.Multer.File & { path: string; filename: string } | undefined
    if (file && celeb.imagePublicId) {
      await cloudinary.uploader.destroy(celeb.imagePublicId).catch(() => { /* ignore */ })
    }

    const price = parsePrice(req.body as Record<string, unknown>, celeb.price)

    const updated = await Celebrity.findByIdAndUpdate(
      req.params['id'],
      {
        ...(body.name         && { name: body.name }),
        ...(body.category     && { category: body.category }),
        ...(body.genre        && { genre: body.genre }),
        ...(body.location     && { location: body.location }),
        ...(body.bio          && { bio: body.bio }),
        ...(body.followers    !== undefined && { followers: body.followers }),
        ...(body.availability && { availability: body.availability }),
        tags: body.tags !== undefined ? splitComma(body.tags) : celeb.tags,
        upcomingDates: body.upcomingDates !== undefined
          ? parseUpcomingDates(body.upcomingDates)
          : celeb.upcomingDates,
        price,
        ...(file ? { image: file.path, imagePublicId: file.filename } : {}),
      },
      { new: true },
    )

    res.json({ celeb: updated })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: (err as Error).message })
  }
}

// DELETE /api/admin/celebs/:id
export const deleteCeleb = async (req: Request, res: Response): Promise<void> => {
  try {
    const celeb = await Celebrity.findById(req.params['id'])
    if (!celeb) { res.status(404).json({ message: 'Celebrity not found.' }); return }

    if (celeb.imagePublicId) {
      await cloudinary.uploader.destroy(celeb.imagePublicId).catch(() => { /* ignore */ })
    }
    await celeb.deleteOne()
    res.json({ message: 'Celebrity removed.' })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: (err as Error).message })
  }
}
