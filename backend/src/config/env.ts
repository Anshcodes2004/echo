import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3001),
  CORS_ORIGIN: z.string().url().default("http://localhost:5173"),
  MONGODB_URI: z.string().min(1),
  DEEPGRAM_API_KEY: z.string().min(1),
  AI_API_TOKEN: z.string().min(1),
  AI_API_BASE_URL: z.string().url(),
  AI_MODEL: z.string().min(1),
  MAX_RECORDING_MINUTES: z.coerce.number().int().positive().max(720).default(180),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid backend environment configuration.", parsed.error.flatten().fieldErrors);
  throw new Error("Backend configuration is invalid. Copy .env.example to .env and set all secrets.");
}

export const env = parsed.data;
