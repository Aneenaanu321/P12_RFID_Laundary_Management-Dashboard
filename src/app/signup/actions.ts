"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createUser,
  findUserByEmail,
  isStrongPassword,
  isValidEmail,
  signSession,
  SESSION_COOKIE,
} from "@/lib/auth";

export type AuthFormState = {
  error?: string;
  success?: string;
  resetLink?: string;
};

export async function signupAction(
  _prev: AuthFormState | undefined,
  formData: FormData
): Promise<AuthFormState> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirmPassword") || "");

  if (!name || name.length < 2) return { error: "Please enter your full name." };
  if (!isValidEmail(email)) return { error: "Please enter a valid email address." };
  if (!isStrongPassword(password)) return { error: "Password must be at least 8 characters." };
  if (password !== confirm) return { error: "Passwords do not match." };

  if (findUserByEmail(email)) {
    return { error: "An account with this email already exists." };
  }

  const user = createUser({
    name,
    email,
    passwordHash: bcrypt.hashSync(password, 10),
  });

  const token = signSession({ id: user.id, name: user.name, email: user.email, role: user.role });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect("/");
}
