import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import connectDB from "./config/db";
import { seedTemplates } from "./utils/email";
import router from "./routes/index";

const app = express();

// Trust the first proxy — required on Render, Railway, Heroku etc.
// Without this, express-rate-limit throws ERR_ERL_UNEXPECTED_X_FORWARDED_FOR
// because it can't read the real client IP from the X-Forwarded-For header
app.set("trust proxy", 1);

// ── Connect DB ────────────────────────────────────────────────────────────────
await connectDB();

// ── Core middleware ───────────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL ?? "http://localhost:5173",
      process.env.ADMIN_URL ?? "http://localhost:5174",
    ],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Rate limiting ─────────────────────────────────────────────────────────────
app.use(
  "/api/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 20,
    message: { message: "Too many requests, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
  }),
);
app.use(
  "/api/admin/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { message: "Too many admin login attempts." },
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api", router);

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found." });
});

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Internal server error.",
    ...(process.env.NODE_ENV === "development" && { error: err.message }),
  });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = Number(process.env.PORT ?? 5000);

app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  await seedTemplates();
});
