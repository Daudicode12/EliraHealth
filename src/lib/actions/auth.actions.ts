"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getProfileByEmail, getExpertByUserId } from "@/lib/db/queries";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  
  let profile;
  try {
    profile = await getProfileByEmail(email);
  } catch (error) {
    console.error("Login DB error:", error);
    return { error: "Database connection failed" };
  }

  if (!profile) {
    return { error: "Invalid credentials" };
  }

  // Set mock auth token cookie
  try {
    const token = `mock-token-${profile.id}`;
    const cookieStore = await cookies();
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });
  } catch (error) {
    console.error("Cookie error:", error);
    return { error: "Failed to set session" };
  }

  // Role-based redirect logic
  let targetPath = "/patient/dashboard";
  
  if (profile.role === "admin") {
    targetPath = "/admin/dashboard";
  } else if (profile.role === "expert") {
    try {
      const expert = await getExpertByUserId(profile.id);
      if (expert?.is_verified) {
        targetPath = "/doctor/dashboard";
      } else {
        targetPath = "/verification-pending";
      }
    } catch (error) {
      console.error("Expert check error:", error);
      targetPath = "/verification-pending";
    }
  }

  redirect(targetPath);
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("auth-token");
  redirect("/login");
}
