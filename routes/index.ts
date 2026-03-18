import { Router } from "express";
import { protect, adminProtect } from "../middleware/auth.js";
import { upload } from "../config/cloudinary.js";

import {
  signup,
  login,
  updateProfile,
  changePassword,
} from "../controllers/authController.js";
import { adminLogin } from "../controllers/adminAuthController.js";
import {
  getCelebs,
  getCeleb,
  adminGetCelebs,
  adminGetCeleb,
  createCeleb,
  updateCeleb,
  deleteCeleb,
  reorderCelebs,
} from "../controllers/celebController.js";
import {
  createBooking,
  getMyBookings,
  adminGetBookings,
  updateBookingStatus,
} from "../controllers/bookingController.js";
import {
  getDashboard,
  getUsers,
  updateUserStatus,
  updateUserMembership,
  getSettings,
  updatePlatformSettings,
  updateNotificationSettings,
  updatePricing,
  updateSuperKey,
  getEmailTemplates,
  updateEmailTemplate,
} from "../controllers/adminController.js";

const router = Router();

// ── Fan Auth ──────────────────────────────────────────────────────────────────
router.post("/auth/signup", signup);
router.post("/auth/login", login);
router.put("/auth/profile", protect, updateProfile);
router.put("/auth/change-password", protect, changePassword);

// ── Public: Celebrities ───────────────────────────────────────────────────────
router.get("/celebs", getCelebs);
router.get("/celebs/:id", getCeleb);

// ── Fan: Bookings ─────────────────────────────────────────────────────────────
router.post("/bookings", protect, createBooking);
router.get("/bookings/my", protect, getMyBookings);

// ── Admin Auth ────────────────────────────────────────────────────────────────
router.post("/admin/auth/login", adminLogin);

// ── Admin: Dashboard ──────────────────────────────────────────────────────────
router.get("/admin/dashboard", adminProtect, getDashboard);

// ── Admin: Celebrities ────────────────────────────────────────────────────────
router.get("/admin/celebs", adminProtect, adminGetCelebs);
router.patch("/admin/celebs/reorder", adminProtect, reorderCelebs);
router.get("/admin/celebs/:id", adminProtect, adminGetCeleb);
router.post("/admin/celebs", adminProtect, upload.single("image"), createCeleb);
router.put(
  "/admin/celebs/:id",
  adminProtect,
  upload.single("image"),
  updateCeleb,
);
router.delete("/admin/celebs/:id", adminProtect, deleteCeleb);

// ── Admin: Bookings ───────────────────────────────────────────────────────────
router.get("/admin/bookings", adminProtect, adminGetBookings);
router.patch("/admin/bookings/:id/status", adminProtect, updateBookingStatus);

// ── Admin: Users ──────────────────────────────────────────────────────────────
router.get("/admin/users", adminProtect, getUsers);
router.patch("/admin/users/:id/status", adminProtect, updateUserStatus);
router.patch("/admin/users/:id/membership", adminProtect, updateUserMembership);

// ── Admin: Settings ───────────────────────────────────────────────────────────
router.get("/admin/settings", adminProtect, getSettings);
router.put("/admin/settings/platform", adminProtect, updatePlatformSettings);
router.put(
  "/admin/settings/notifications",
  adminProtect,
  updateNotificationSettings,
);
router.put("/admin/settings/pricing", adminProtect, updatePricing);
router.put("/admin/settings/superkey", adminProtect, updateSuperKey);

// ── Admin: Email Templates ────────────────────────────────────────────────────
router.get("/admin/email-templates", adminProtect, getEmailTemplates);
router.put("/admin/email-templates/:key", adminProtect, updateEmailTemplate);

export default router;
