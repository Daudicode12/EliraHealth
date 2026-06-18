"use server";

import { redirect } from "next/navigation";
import { createProfile, createExpert } from "@/lib/db/queries";

export type SignupState = {
  success?: boolean;
  errors?: Record<string, string>;
  message?: string;
};

export async function signupAction(prevState: SignupState | null, formData: FormData): Promise<SignupState> {
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const licenseNumber = formData.get("licenseNumber") as string;
  const specialization = formData.get("specialization") as string;
  const hospital = formData.get("hospital") as string;
  const yearsExperience = formData.get("yearsExperience") as string;

  // Validation
  const errors: Record<string, string> = {};

  if (!fullName || fullName.trim().length < 2) errors.fullName = "Full name required";
  if (!email || !email.includes("@")) errors.email = "Valid email required";
  if (!password || password.length < 8) errors.password = "Min 8 characters";
  if (password !== confirmPassword) errors.confirmPassword = "Passwords match required";
  if (!licenseNumber) errors.licenseNumber = "License number required";
  if (!specialization) errors.specialization = "Specialization required";
  if (!hospital) errors.hospital = "Hospital required";
  
  const yearsExp = parseInt(yearsExperience);
  if (isNaN(yearsExp)) errors.yearsExperience = "Valid years required";

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  let success = false;
  try {
    const userId = crypto.randomUUID();
    const names = fullName.split(" ");
    
    await createProfile({
      id: userId,
      email,
      first_name: names[0],
      last_name: names.slice(1).join(" "),
      role: 'expert',
    });

    await createExpert({
      user_id: userId,
      display_name: fullName,
      specialties: JSON.stringify([specialization]),
      credentials: licenseNumber,
      years_of_experience: yearsExp,
      is_verified: 0,
    });

    success = true;
  } catch (error) {
    console.error("Signup error:", error);
    return { success: false, message: "Database error. Please try again." };
  }

  if (success) {
    redirect("/verification-pending");
  }

  return { success: true };
}
