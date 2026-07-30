"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import {
  findUserById,
  findValidResetToken,
  isStrongPassword,
  markResetTokenUsed,
  updateUserPassword,
} from "@/lib/auth";
import type { AuthFormState } from "@/app/signup/actions";

export async function resetPasswordAction(
  _prev: AuthFormState | undefined,
  formData: FormData
): Promise<AuthFormState> {
  const token = String(formData.get("token") || "").trim();
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirmPassword") || "");

  if (!token) return { error: "Reset link is invalid or missing." };
  if (!isStrongPassword(password)) return { error: "Password must be at least 8 characters." };
  if (password !== confirm) return { error: "Passwords do not match." };

  const row = findValidResetToken(token);
  if (!row) return { error: "This reset link is invalid or has expired." };

  const user = findUserById(row.userId);
  if (!user) return { error: "This reset link is invalid or has expired." };

  updateUserPassword(user.id, bcrypt.hashSync(password, 10));
  markResetTokenUsed(row.id);

  redirect("/login?reset=1");
}
