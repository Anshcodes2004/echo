import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { UserModel } from "../schemas/user.schema.js";

const TOKEN_TTL = "30d";

export class AuthError extends Error {}

export class AuthService {
  async signUp(name: string, email: string, password: string) {
    const normalized = email.trim().toLowerCase();
    const existing = await UserModel.findOne({ email: normalized });
    if (existing)
      throw new AuthError("An account with this email already exists.");
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await UserModel.create({
      name: name.trim(),
      email: normalized,
      passwordHash,
    });
    return this.issueToken(user._id.toString(), user.email, user.name);
  }

  async signIn(email: string, password: string) {
    const normalized = email.trim().toLowerCase();
    const user = await UserModel.findOne({ email: normalized });
    if (!user) throw new AuthError("Incorrect email or password.");
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new AuthError("Incorrect email or password.");
    return this.issueToken(user._id.toString(), user.email, user.name);
  }

  async me(userId: string) {
    const user = await UserModel.findById(userId).lean();
    return user
      ? { id: user._id.toString(), email: user.email, name: user.name }
      : null;
  }

  private issueToken(userId: string, email: string, name?: string) {
    const token = jwt.sign({ sub: userId, email, name }, env.JWT_SECRET, {
      expiresIn: TOKEN_TTL,
    });
    return { token, user: { id: userId, email, name } };
  }
}

export function verifyToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as { sub: string; email: string };
}
