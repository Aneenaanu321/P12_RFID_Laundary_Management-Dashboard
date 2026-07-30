"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { findUserByEmail, signSession, SESSION_COOKIE } from "@/lib/auth";

export async function loginAction(_prevState: { error?: string } | undefined, formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const remember = formData.get("remember") === "on";
  const from = String(formData.get("from") || "/");
  const safeFrom = from.startsWith("/") && !from.startsWith("//") ? from : "/";

  const user = findUserByEmail(email);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return { error: "Invalid email or password." };
  }

  const token = signSession(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    remember ? "30d" : "1d"
  );
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    ...(remember
      ? { maxAge: 60 * 60 * 24 * 30 } // 30 days
      : {}), // session cookie — cleared when browser closes
  });

  redirect(safeFrom === "/login" ? "/" : safeFrom);
}
