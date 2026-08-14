import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { AuthService, AuthError } from "../services/auth.service.js";
import { requireAuth } from "../middleware/auth.js";

const credentialsSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(72),
});

const signupSchema = credentialsSchema.extend({
  name: z.string().trim().min(1).max(80),
});

export async function authRoutes(
  app: FastifyInstance,
  options: { service: AuthService },
) {
  const { service } = options;

  app.post("/api/auth/signup", async (request, reply) => {
    const { name, email, password } = signupSchema.parse(request.body);
    try {
      const result = await service.signUp(name, email, password);
      return reply.code(201).send(result);
    } catch (error) {
      if (error instanceof AuthError)
        return reply.code(409).send({ error: error.message });
      throw error;
    }
  });

  app.post("/api/auth/signin", async (request, reply) => {
    const { email, password } = credentialsSchema.parse(request.body);
    try {
      const result = await service.signIn(email, password);
      return reply.send(result);
    } catch (error) {
      if (error instanceof AuthError)
        return reply.code(401).send({ error: error.message });
      throw error;
    }
  });

  app.get(
    "/api/auth/me",
    { preHandler: requireAuth },
    async (request, reply) => {
      const user = await service.me(request.userId);
      return user
        ? reply.send(user)
        : reply.code(404).send({ error: "User not found" });
    },
  );
}
