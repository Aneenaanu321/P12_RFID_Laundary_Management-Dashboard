import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { get, run } from "./db";

const SECRET = process.env.JWT_SECRET || "rfid-linen-dev-secret-change-in-production";
export const SESSION_COOKIE = "rfid_session";
export const DEFAULT_SIGNUP_ROLE = "VIEWER";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export function signSession(user: SessionUser): string {
  return jwt.sign(user, SECRET, { expiresIn: "7d" });
}

export function verifySession(token: string): SessionUser | null {
  try {
    return jwt.verify(token, SECRET) as SessionUser;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

export type UserRow = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
};

export function findUserByEmail(email: string): UserRow | undefined {
  return get<UserRow>("SELECT * FROM User WHERE email = ?", [email]);
}

export function findUserById(id: string): UserRow | undefined {
  return get<UserRow>("SELECT * FROM User WHERE id = ?", [id]);
}

export function createUser(input: {
  name: string;
  email: string;
  passwordHash: string;
  role?: string;
}): UserRow {
  const id = crypto.randomUUID();
  const role = input.role ?? DEFAULT_SIGNUP_ROLE;
  run(
    `INSERT INTO User (id, name, email, passwordHash, role) VALUES (?,?,?,?,?)`,
    [id, input.name, input.email, input.passwordHash, role]
  );
  return { id, name: input.name, email: input.email, passwordHash: input.passwordHash, role };
}

export function updateUserPassword(userId: string, passwordHash: string) {
  run(`UPDATE User SET passwordHash = ? WHERE id = ?`, [passwordHash, userId]);
}

type ResetTokenRow = {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  used: number;
};

export function createPasswordResetToken(userId: string): { token: string; expiresAt: string } {
  // Invalidate prior unused tokens for this user
  run(`UPDATE PasswordResetToken SET used = 1 WHERE userId = ? AND used = 0`, [userId]);

  const id = crypto.randomUUID();
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
  run(
    `INSERT INTO PasswordResetToken (id, userId, token, expiresAt, used) VALUES (?,?,?,?,0)`,
    [id, userId, token, expiresAt]
  );
  return { token, expiresAt };
}

export function findValidResetToken(token: string): ResetTokenRow | undefined {
  return get<ResetTokenRow>(
    `SELECT * FROM PasswordResetToken
     WHERE token = ? AND used = 0 AND datetime(expiresAt) > datetime('now')`,
    [token]
  );
}

export function markResetTokenUsed(tokenId: string) {
  run(`UPDATE PasswordResetToken SET used = 1 WHERE id = ?`, [tokenId]);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isStrongPassword(password: string): boolean {
  return password.length >= 8;
}
