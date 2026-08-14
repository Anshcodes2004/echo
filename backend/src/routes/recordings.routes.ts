import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { RecordingService } from "../services/recording.service.js";

const createSchema = z.object({
  mode: z.enum(["meeting", "personal"]),
  title: z.string().trim().min(1).max(160).optional(),
  language: z.string().trim().min(2).max(24).default("en-US"),
});
const listSchema = z.object({
  mode: z.enum(["meeting", "personal"]).optional(),
  query: z.string().trim().max(160).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(30),
  offset: z.coerce.number().int().min(0).default(0),
});
const idSchema = z.object({ id: z.string().min(1) });
const renameSchema = z.object({ title: z.string().trim().min(1).max(160) });

export async function recordingRoutes(app: FastifyInstance, options: { service: RecordingService }) {
  const { service } = options;
  app.post("/api/recordings", async (request, reply) => {
    const input = createSchema.parse(request.body);
    const title = input.title ?? `${input.mode === "meeting" ? "Meeting" : "Personal recording"} — ${new Date().toLocaleDateString("en-CA")}`;
    const recording = await service.create(input.mode, title, input.language);
    return reply.code(201).send(serialize(recording));
  });

  app.get("/api/recordings", async (request) => {
    const input = listSchema.parse(request.query);
    const recordings = await service.list({ mode: input.mode, query: input.query, limit: input.limit, skip: input.offset });
    return { recordings: recordings.map(serialize), limit: input.limit, offset: input.offset };
  });

  app.get("/api/recordings/:id", async (request, reply) => {
    const { id } = idSchema.parse(request.params);
    const recording = await service.get(id);
    return recording ? serialize(recording) : reply.code(404).send({ error: "Recording not found" });
  });

  app.patch("/api/recordings/:id", async (request, reply) => {
    const { id } = idSchema.parse(request.params);
    const { title } = renameSchema.parse(request.body);
    const recording = await service.rename(id, title);
    return recording ? serialize(recording) : reply.code(404).send({ error: "Recording not found" });
  });

  app.post("/api/recordings/:id/finalize", async (request, reply) => {
    const { id } = idSchema.parse(request.params);
    const recording = await service.finalize(id);
    return recording ? serialize(recording) : reply.code(404).send({ error: "Recording not found" });
  });

  app.delete("/api/recordings/:id", async (request, reply) => {
    const { id } = idSchema.parse(request.params);
    const recording = await service.remove(id);
    return recording ? reply.code(204).send() : reply.code(404).send({ error: "Recording not found" });
  });
}

function serialize(recording: any) {
  if (!recording) return recording;
  const { _id, ...rest } = recording.toObject ? recording.toObject() : recording;
  return { id: _id.toString(), ...rest };
}
