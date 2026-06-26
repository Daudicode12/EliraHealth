// src/lib/actions/signup-user.actions.ts
"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createProfile, getProfileByEmail } from "@/lib/db/queries";

export type SignupState = {
  success?: boolean;
  errors?: Record<string, string>;
  message?: string;
};

export async function signupUserAction(prevState: SignupState | null, formData: FormData): Promise<SignupState> {
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  // Validation
  const errors: Record<string, string> = {};

  if (!firstName || firstName.trim().length < 2) errors.firstName = "First name is required";
  if (!lastName || lastName.trim().length < 2) errors.lastName = "Last name is required";
  if (!email || !email.includes("@")) errors.email = "Valid email is required";
  if (!password || password.length < 8) errors.password = "Password must be at least 8 characters";
  if (password !== confirmPassword) errors.confirmPassword = "Passwords must match";

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  const userId = crypto.randomUUID();

  try {
    const existing = await getProfileByEmail(email);
    if (existing) {
      return { success: false, message: "Email is already registered" };
    }

    await createProfile({
      id: userId,
      email,
      first_name: firstName,
      last_name: lastName,
      role: 'user',
      current_cycle_mode: null,
    });

  } catch (error) {
    console.error("User signup DB error:", error);
    return { success: false, message: "Database connection failed. Please try again." };
  }

  // Set Auth Token Cookie
  try {
    const payload = Buffer.from(JSON.stringify({
      id: userId,
      role: 'user',
      status: 'active'
    })).toString('base64');

    const token = `mock-jwt-${payload}`;
    const cookieStore = await cookies();
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });
  } catch (error) {
    console.error("Cookie set error during user signup:", error);
    return { success: false, message: "Failed to establish session. Please try logging in." };
  }

  redirect("/user/dashboard");
}
