// src/lib/actions/signup.actions.ts
"use server";

import { redirect } from "next/navigation";
import { createProfile, createExpert } from "@/lib/db/queries";

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

  let success = false;
  try {
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

    success = true;
  } catch (error) {
    console.error("Signup error:", error);
    return { success: false, message: "Database error. Please try again." };
  }

  if (success) {
    redirect("/specialist/profile/complete");
  }

  return { success: true };
}
