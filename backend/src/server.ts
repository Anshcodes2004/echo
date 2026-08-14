import mongoose from "mongoose";
import { buildApp } from "./app.js";
import { env } from "./config/env.js";
import { RecordingService } from "./services/recording.service.js";
import { TranscriptionGateway } from "./websocket/transcription.gateway.js";

async function start() {
  await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 10_000 });
  const recordings = new RecordingService();
  const app = await buildApp(recordings);
  const gateway = new TranscriptionGateway(recordings);
  app.server.on("upgrade", (request, socket, head) => gateway.handleUpgrade(request, socket, head));
  await app.listen({ port: env.PORT, host: "0.0.0.0" });
}

void start().catch((error) => { console.error("Backend startup failed", error); process.exit(1); });
