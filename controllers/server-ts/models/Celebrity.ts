import { Schema, model, Model, Document } from 'mongoose'
import type {
  ICelebrity,
  CelebCategory,
  CelebAvailability,
} from '../types/index.js'

export interface ICelebrityDocument extends ICelebrity, Document {}

interface ICelebrityModel extends Model<ICelebrityDocument> {}

const celebSchema = new Schema<ICelebrityDocument, ICelebrityModel>(
  {
    name:     { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: [
        'Musicians / Artists',
        'Actors / Actresses',
        'Athletes / Sports Stars',
        'Content Creators / Influencers',
      ] satisfies CelebCategory[],
    },
    genre:    { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    bio:      { type: String, required: true },
    followers:{ type: String, default: '' },
    tags:     [{ type: String }],
    image:        { type: String, required: true },
    imagePublicId:{ type: String },
    price: {
      meetup:  { type: Number, required: true, min: 1 },
      event:   { type: Number, required: true, min: 1 },
      fancard: { type: Number, required: true, min: 1 },
    },
    availability: {
      type: String,
      enum: ['Available', 'Limited', 'Booked Out'] satisfies CelebAvailability[],
      default: 'Available' as CelebAvailability,
    },
    upcomingDates: [{ date: { type: String, required: true }, location: { type: String, required: true } }],
    rating:        { type: Number, default: 0, min: 0, max: 5 },
    reviewCount:   { type: Number, default: 0 },
    active:        { type: Boolean, default: true },
  },
  { timestamps: true },
)

celebSchema.index({ name: 'text', genre: 'text' })

const Celebrity = model<ICelebrityDocument, ICelebrityModel>('Celebrity', celebSchema)
export default Celebrity
