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

  // Set auth token cookie with encoded user data for Edge middleware
  try {
    let status = 'active';
    let targetPath = "/patient/dashboard";
    
    if (profile.role === "admin") {
      targetPath = "/admin/dashboard";
    } else if (profile.role === "expert") {
      try {
        const expert = await getExpertByUserId(profile.id);
        status = expert?.verification_status || 'pending';
        
        if (status === 'approved') {
          targetPath = "/doctor/dashboard";
        } else if (status === 'rejected') {
          targetPath = "/application-rejected";
        } else if (status === 'suspended') {
          targetPath = "/account-suspended";
        } else {
          targetPath = "/verification-pending";
        }
      } catch (error) {
        console.error("Expert check error:", error);
        targetPath = "/verification-pending";
        status = 'pending';
      }
    }

    // Create a simple payload. In a real app, this would be a signed JWT.
    const payload = Buffer.from(JSON.stringify({
      id: profile.id,
      role: profile.role,
      status: status
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
