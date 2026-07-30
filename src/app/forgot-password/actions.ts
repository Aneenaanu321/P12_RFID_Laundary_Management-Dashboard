"use server";

import {
  createPasswordResetToken,
  findUserByEmail,
  isValidEmail,
} from "@/lib/auth";
import type { AuthFormState } from "@/app/signup/actions";

export async function forgotPasswordAction(
  _prev: AuthFormState | undefined,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();

  if (!isValidEmail(email)) {
    return { error: "Please enter a valid email address." };
  }

  const user = findUserByEmail(email);

  // Always return a success-style response to avoid email enumeration.
  // In this prototype (no email provider), surface the reset link when the user exists.
  if (!user) {
    return {
      success: "If an account exists for that email, a reset link is ready.",
    };
  }

  const { token } = createPasswordResetToken(user.id);
  return {
    success: "If an account exists for that email, a reset link is ready.",
    resetLink: `/reset-password?token=${token}`,
  };
}
