import { Schema, model, Model, Document } from 'mongoose'
import type { IEmailTemplate, EmailTemplateKey } from '../types/index.js'

export interface IEmailTemplateDocument extends IEmailTemplate, Document {}

interface IEmailTemplateModel extends Model<IEmailTemplateDocument> {}

const emailTemplateSchema = new Schema<IEmailTemplateDocument, IEmailTemplateModel>(
  {
    key: {
      type: String,
      unique: true,
      enum: [
        'booking_submitted',
        'booking_approved',
        'booking_failed',
      ] satisfies EmailTemplateKey[],
    },
    subject:  { type: String, required: true },
    bodyHtml: { type: String, required: true },
    active:   { type: Boolean, default: true },
  },
  { timestamps: true },
)

const EmailTemplate = model<IEmailTemplateDocument, IEmailTemplateModel>(
  'EmailTemplate',
  emailTemplateSchema,
)
export default EmailTemplate
