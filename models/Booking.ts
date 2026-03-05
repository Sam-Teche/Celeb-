import { Schema, model, Model, Document } from 'mongoose'
import crypto from 'crypto'
import type { IBooking, BookingType, BookingStatus } from '../types/index.js'

export interface IBookingDocument extends IBooking, Document {}

interface IBookingModel extends Model<IBookingDocument> {}

const bookingSchema = new Schema<IBookingDocument, IBookingModel>(
  {
    refCode:       { type: String, unique: true },
    user:          { type: Schema.Types.ObjectId, ref: 'User', required: true },
    celebrity:     { type: Schema.Types.ObjectId, ref: 'Celebrity', required: true },
    bookingType: {
      type: String,
      enum: ['meetup', 'event', 'fancard'] satisfies BookingType[],
      required: true,
    },
    razorGoldCode: { type: String, required: true },
    holderName:    { type: String, required: true },
    amount:     { type: Number, required: true },
    status: {
      type: String,
      enum: ['payment_pending', 'approved', 'failed'] satisfies BookingStatus[],
      default: 'payment_pending' as BookingStatus,
    },
    adminNote:     { type: String, default: '' },
    scheduledDate: { type: String, default: '' },
    location:      { type: String, default: '' },
    submissionEmailSent:   { type: Boolean, default: false },
    statusUpdateEmailSent: { type: Boolean, default: false },
  },
  { timestamps: true },
)

bookingSchema.pre('save', function (next) {
  if (!this.refCode) {
    this.refCode = 'RZG-' + crypto.randomBytes(4).toString('hex').toUpperCase()
  }
  next()
})

const Booking = model<IBookingDocument, IBookingModel>('Booking', bookingSchema)
export default Booking
