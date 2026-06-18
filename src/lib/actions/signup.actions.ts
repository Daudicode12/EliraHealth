"use server";

import { redirect } from "next/navigation";
import { registerDoctor } from "@/lib/services/authService";

export interface SignupFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  licenseNumber: string;
  specialization: string;
  hospital: string;
  yearsExperience: string;
}

export async function signupAction(formData: FormData) {
  // Extract form data
  const data: SignupFormData = {
    fullName: formData.get("fullName") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
    licenseNumber: formData.get("licenseNumber") as string,
    specialization: formData.get("specialization") as string,
    hospital: formData.get("hospital") as string,
    yearsExperience: formData.get("yearsExperience") as string,
  };

  // Server-side validation
  const errors: Partial<Record<keyof SignupFormData, string>> = {};

  if (!data.fullName || data.fullName.trim().length < 2) {
    errors.fullName = "Full name must be at least 2 characters";
  }

  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Please enter a valid email address";
  }

  if (!data.password || data.password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  }

  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  if (!data.licenseNumber || data.licenseNumber.trim().length < 3) {
    errors.licenseNumber = "Please enter a valid license number";
  }

  if (!data.specialization) {
    errors.specialization = "Please select a specialization";
  }

  if (!data.hospital || data.hospital.trim().length < 2) {
    errors.hospital = "Please enter hospital/clinic name";
  }

  const yearsExp = parseInt(data.yearsExperience);
  if (isNaN(yearsExp) || yearsExp < 0 || yearsExp > 70) {
    errors.yearsExperience = "Please enter valid years of experience (0-70)";
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  // Call registration service
  const result = await registerDoctor({
    full_name: data.fullName,
    email: data.email,
    password: data.password,
    license_number: data.licenseNumber,
    specialization: data.specialization,
    hospital: data.hospital,
    years_experience: yearsExp,
  });

  if (!result.success) {
    return {
      success: false,
      errors: {
        email:
          result.error?.includes("already registered") ||
          result.error?.includes("already exists")
            ? "This email is already registered"
            : result.error || "Registration failed",
      },
    };
  }

  // Success - redirect to verification pending page
  redirect("/verification-pending");
}
