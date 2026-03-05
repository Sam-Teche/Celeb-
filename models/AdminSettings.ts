import { Schema, model, Model, Document } from 'mongoose'
import bcrypt from 'bcryptjs'
import type { IAdminSettings } from '../types/index.js'

export interface IAdminSettingsDocument extends IAdminSettings, Document {}

interface IAdminSettingsModel extends Model<IAdminSettingsDocument> {
  getInstance(): Promise<IAdminSettingsDocument>
}

const adminSettingsSchema = new Schema<IAdminSettingsDocument, IAdminSettingsModel>(
  {
    singleton:    { type: Boolean, default: true, unique: true },
    superKeyHash: { type: String },

    platform: {
      siteName:            { type: String,  default: 'CelebConnect' },
      maintenanceMode:     { type: Boolean, default: false },
      newRegistrations:    { type: Boolean, default: true },
      requireEmailVerify:  { type: Boolean, default: false },
      autoConfirmBookings: { type: Boolean, default: false },
    },

    notifications: {
      emailOnNewBooking:  { type: Boolean, default: true },
      emailOnNewUser:     { type: Boolean, default: false },
      emailDailySummary:  { type: Boolean, default: false },
      adminEmail:         { type: String,  default: '' },
    },

    pricing: {
      silver:  { type: Number, default: 9.99 },
      gold:    { type: Number, default: 24.99 },
      diamond: { type: Number, default: 59.99 },
    },
  },
  { timestamps: true },
)

adminSettingsSchema.methods.verifySuperKey = async function (
  this: IAdminSettingsDocument,
  candidate: string,
): Promise<boolean> {
  if (!this.superKeyHash) {
    // Fall back to env key before first update
    return candidate === process.env.ADMIN_SUPER_KEY
  }
  return bcrypt.compare(candidate, this.superKeyHash)
}

adminSettingsSchema.statics.getInstance = async function (
  this: IAdminSettingsModel,
): Promise<IAdminSettingsDocument> {
  let settings = await this.findOne({ singleton: true })
  if (!settings) {
    settings = await this.create({ singleton: true })
  }
  return settings
}

const AdminSettings = model<IAdminSettingsDocument, IAdminSettingsModel>(
  'AdminSettings',
  adminSettingsSchema,
)
export default AdminSettings
