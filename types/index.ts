import { Request } from "express";
import { Types } from "mongoose";

// ── Enums ─────────────────────────────────────────────────────────────────────

export type UserProvider =
  | "local"
  | "google"
  | "facebook"
  | "twitter"
  | "apple";
export type UserStatus = "active" | "banned";
export type MembershipTier = "silver" | "gold" | "diamond";
export type BookingType = "meetup" | "event" | "fancard";
export type BookingStatus = "payment_pending" | "approved" | "failed";
export type CelebCategory =
  | "Musicians / Artists"
  | "Actors / Actresses"
  | "Athletes / Sports Stars"
  | "Content Creators / Influencers";
export type CelebAvailability = "Available" | "Limited" | "Booked Out";
export type EmailTemplateKey =
  | "booking_submitted"
  | "booking_approved"
  | "booking_failed";

// ── Mongoose Document Interfaces ──────────────────────────────────────────────

export interface IUser {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password?: string;
  provider: UserProvider;
  providerId?: string;
  avatar?: string;
  bio: string;
  membership: MembershipTier;
  status: UserStatus;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Methods
  comparePassword(candidate: string): Promise<boolean>;
  toSafeObject(): Omit<IUser, "password" | "providerId">;
}

export interface IPrice {
  meetup: number;
  event: number;
  fancard: number;
}

export interface ICelebrity {
  _id: Types.ObjectId;
  name: string;
  category: CelebCategory;
  genre: string;
  location: string;
  bio: string;
  followers: string;
  tags: string[];
  image: string;
  imagePublicId?: string;
  price: IPrice;
  eventEnabled: boolean;
  availability: CelebAvailability;
  upcomingDates: { date: string; location: string }[];
  rating: number;
  reviewCount: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRazorGoldCard {
  code: string;
  amount: number;
}

export interface IBooking {
  _id: Types.ObjectId;
  refCode: string;
  user: Types.ObjectId | IUser;
  celebrity: Types.ObjectId | ICelebrity;
  bookingType: BookingType;
  razorGoldCode: string;
  razorGoldCards: IRazorGoldCard[];
  holderName: string;
  amount: number;
  status: BookingStatus;
  adminNote: string;
  scheduledDate: string;
  location: string;
  submissionEmailSent: boolean;
  statusUpdateEmailSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEmailTemplate {
  _id: Types.ObjectId;
  key: EmailTemplateKey;
  subject: string;
  bodyHtml: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPlatformSettings {
  siteName: string;
  maintenanceMode: boolean;
  newRegistrations: boolean;
  requireEmailVerify: boolean;
  autoConfirmBookings: boolean;
}

export interface INotificationSettings {
  emailOnNewBooking: boolean;
  emailOnNewUser: boolean;
  emailDailySummary: boolean;
  adminEmail: string;
}

export interface IPricingSettings {
  silver: number;
  gold: number;
  diamond: number;
}

export interface IAdminSettings {
  _id: Types.ObjectId;
  singleton: boolean;
  superKeyHash?: string;
  platform: IPlatformSettings;
  notifications: INotificationSettings;
  pricing: IPricingSettings;
  createdAt: Date;
  updatedAt: Date;
  // Methods
  verifySuperKey(candidate: string): Promise<boolean>;
}

// ── Request Extensions ────────────────────────────────────────────────────────

export interface AuthRequest extends Request {
  user: IUser;
}

export interface AdminRequest extends Request {
  admin: { role: string; name: string; iat: number; exp: number };
}

// ── Email ─────────────────────────────────────────────────────────────────────

export interface EmailVars {
  fanName?: string;
  celebName?: string;
  bookingType?: string;
  refCode?: string;
  amount?: string;
  adminNote?: string;
  scheduledDate?: string;
  [key: string]: string | undefined;
}

export interface EmailResult {
  success: boolean;
  id?: string;
  error?: unknown;
}

// ── Safe User (no sensitive fields) ──────────────────────────────────────────
export type SafeUser = Omit<IUser, "password" | "providerId">;
