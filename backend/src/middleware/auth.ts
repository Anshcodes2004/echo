import type { FastifyReply, FastifyRequest } from "fastify";
import { verifyToken } from "../services/auth.service.js";

declare module "fastify" {
  interface FastifyRequest {
    userId: string;
  }
}

export async function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const header = request.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token)
    return reply.code(401).send({ error: "Missing authentication token." });
  try {
    const payload = verifyToken(token);
    request.userId = payload.sub;
  } catch {
    return reply
      .code(401)
      .send({ error: "Invalid or expired session. Please sign in again." });
  }
}
