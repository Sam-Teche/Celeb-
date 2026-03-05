import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import connectDB from "./config/db.js";
import { seedTemplates } from "./utils/email.js";
import router from "./routes/index.js";

const app = express();
const PORT = Number(process.env.PORT ?? 5000);

// ── Core middleware ───────────────────────────────────────────────────────────
app.use(helmet());
const allowedOrigins = [
  process.env.CLIENT_URL ?? "http://localhost:5173",
  process.env.ADMIN_URL ?? "http://localhost:5174",
  process.env["NETLIFY_URL"] ??
    "https://peaceful-gingersnap-8e21e7.netlify.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (mobile apps, curl, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: ${origin}`));
      }
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Rate limiting ─────────────────────────────────────────────────────────────
app.use(
  "/api/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000,
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

// ── Bootstrap server ──────────────────────────────────────────────────────────
async function bootstrap() {
  await connectDB();
  await seedTemplates();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

bootstrap();
