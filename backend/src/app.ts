import Fastify from "fastify";
import cors from "@fastify/cors";
import { ZodError } from "zod";
import { env } from "./config/env.js";
import { recordingRoutes } from "./routes/recordings.routes.js";
import { RecordingService } from "./services/recording.service.js";

export async function buildApp(service = new RecordingService()) {
  const app = Fastify({ logger: env.NODE_ENV === "development", bodyLimit: 1_048_576 });
  await app.register(cors, { origin: env.CORS_ORIGIN, methods: ["GET", "POST", "PATCH", "DELETE"] });
  app.get("/api/health", async () => ({ status: "ok" }));
  await app.register(recordingRoutes, { service });
  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) return reply.code(400).send({ error: "Invalid request", details: error.flatten() });
    app.log.error(error);
    return reply.code(500).send({ error: "Internal server error" });
  });
  return app;
}
