import { Schema, model, Model, Document } from 'mongoose'
import bcrypt from 'bcryptjs'
import type { IUser, MembershipTier, UserProvider, UserStatus } from '../types/index.js'

export interface IUserDocument extends IUser, Document {
  _id: Schema.Types.ObjectId
}

interface IUserModel extends Model<IUserDocument> {}

const userSchema = new Schema<IUserDocument, IUserModel>(
  {
    firstName:  { type: String, required: true, trim: true },
    lastName:   { type: String, required: true, trim: true },
    email:      { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:   { type: String, select: false },
    provider:   {
      type: String,
      enum: ['local', 'google', 'facebook', 'twitter', 'apple'] satisfies UserProvider[],
      default: 'local' as UserProvider,
    },
    providerId:    { type: String },
    avatar:        { type: String },
    bio:           { type: String, default: '' },
    membership:    {
      type: String,
      enum: ['silver', 'gold', 'diamond'] satisfies MembershipTier[],
      default: 'silver' as MembershipTier,
    },
    status: {
      type: String,
      enum: ['active', 'banned'] satisfies UserStatus[],
      default: 'active' as UserStatus,
    },
    emailVerified: { type: Boolean, default: false },
  },
  { timestamps: true },
)

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

userSchema.methods.comparePassword = async function (
  this: IUserDocument,
  candidate: string,
): Promise<boolean> {
  if (!this.password) return false
  return bcrypt.compare(candidate, this.password)
}

userSchema.methods.toSafeObject = function (this: IUserDocument) {
  const obj = this.toObject() as Record<string, unknown>
  delete obj['password']
  delete obj['providerId']
  return obj
}

const User = model<IUserDocument, IUserModel>('User', userSchema)
export default User
