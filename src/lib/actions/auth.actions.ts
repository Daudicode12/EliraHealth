"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getProfileByEmail, getExpertByUserId } from "@/lib/db/queries";
import { verifyPassword } from "@/lib/auth/password";
import { createSessionToken } from "@/lib/auth/session";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  let profile;
  try {
    profile = await getProfileByEmail(email);
  } catch (error) {
    console.error("Login DB error:", error);
    return { error: "Database connection failed" };
  }

  if (!profile || !profile.password_hash) {
    return { error: "Invalid credentials" };
  }

  const passwordValid = await verifyPassword(password, profile.password_hash);
  if (!passwordValid) {
    return { error: "Invalid credentials" };
  }

  // Set auth token cookie with encoded user data for Edge middleware
  try {
    let status = 'active';
    let targetPath = "/user/dashboard";
    
    if (profile.role === "admin") {
      targetPath = "/admin/dashboard";
    } else if (profile.role === "expert") {
      try {
        const expert = await getExpertByUserId(profile.id);
        status = expert?.profile_status || 'profile_incomplete';
        
        if (status === 'rejected') {
          targetPath = "/specialist/application-rejected";
        } else if (status === 'suspended') {
          targetPath = "/specialist/account-suspended";
        } else if (status === 'profile_incomplete') {
          targetPath = "/specialist/profile/complete";
        } else {
          targetPath = "/specialist/dashboard";
        }
      } catch (error) {
        console.error("Expert check error:", error);
        targetPath = "/specialist/profile/complete";
        status = 'profile_incomplete';
      }
    }

    const token = await createSessionToken({
      id: profile.id,
      role: profile.role,
      status: status,
    });

    const cookieStore = await cookies();
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    redirect(targetPath);
  } catch (error) {
    if ((error as Error).message === "NEXT_REDIRECT") throw error;
    console.error("Cookie error:", error);
    return { error: "Failed to set session" };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("auth-token");
  redirect("/login");
}
