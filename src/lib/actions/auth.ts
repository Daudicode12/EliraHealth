"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getProfileByEmail, createProfile, createExpert, getExpertByUserId } from "@/lib/db/queries";

export async function loginUser(formData: FormData) {
  const email = formData.get("email") as string;
  // const password = formData.get("password") as string; // Not used in mock implementation

  const profile = await getProfileByEmail(email);

  if (!profile) return { error: "Invalid credentials" };

  // Mock verification
  const token = `mock-token-${profile.id}`;
  (await cookies()).set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  if (profile.role === "admin") redirect("/admin/dashboard");
  if (profile.role === "expert") {
    const expert = await getExpertByUserId(profile.id);
    if (expert?.is_verified) redirect("/doctor/dashboard");
    redirect("/verification-pending");
  }
  redirect("/patient/dashboard");
}

export async function signupExpert(formData: FormData) {
  const email = formData.get("email") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const specialties = formData.get("specialties") ? JSON.parse(formData.get("specialties") as string) : [];
  
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
    specialties: JSON.stringify(specialties),
    is_verified: 0,
  });
  
  redirect("/verification-pending");
}

export async function logoutUser() {
  (await cookies()).delete("auth-token");
  redirect("/login");
}
