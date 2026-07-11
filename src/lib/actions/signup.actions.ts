"use server";

import { signAccessToken } from '@/lib/auth/jwt';
// src/lib/actions/signup.actions.ts

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createProfile, createExpert, getProfileByEmail } from "@/lib/db/queries";

export type SignupState = {
  success?: boolean;
  errors?: Record<string, string>;
  message?: string;
};

export async function signupAction(prevState: SignupState | null, formData: FormData): Promise<SignupState> {
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  // Validation
  const errors: Record<string, string> = {};

  if (!firstName || firstName.trim().length < 2) errors.firstName = "First name required";
  if (!lastName || lastName.trim().length < 2) errors.lastName = "Last name required";
  if (!email || !email.includes("@")) errors.email = "Valid email required";
  if (!password || password.length < 8) errors.password = "Min 8 characters";
  if (password !== confirmPassword) errors.confirmPassword = "Passwords match required";

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  try {
    const existingProfile = await getProfileByEmail(email);
    if (existingProfile) {
      return { success: false, message: "This email is already registered. Please sign in instead." };
    }

    const userId = crypto.randomUUID();
    
    await createProfile({
      id: userId,
      email,
      first_name: firstName,
      last_name: lastName,
      role: 'expert',
    });

    await createExpert({
      user_id: userId,
      display_name: `${firstName} ${lastName}`,
      specialties: '[]', // Default empty JSON list
      profile_status: 'profile_incomplete',
    });

    // Set auth token cookie with encoded user data for Edge middleware
    const token = signAccessToken({
      userId: userId,
      email: null,
      role: 'expert',
      status: 'profile_incomplete'
    });
    const cookieStore = await cookies();
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

  } catch (error) {
    console.error("Signup error:", error);
    return { success: false, message: "Database error. Please try again." };
  }

  redirect("/specialist/profile/complete");
}
