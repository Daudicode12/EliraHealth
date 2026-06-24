// src/app/specialist/profile/complete/page.tsx
import { getExpertByUserId, updateExpert, updateProfile, createNotification } from "@/lib/db/queries";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Stethoscope, Award, FileCheck, CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { CompleteProfileForm } from "./CompleteProfileForm";

// Zod Schema for validation
const completeProfileSchema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 characters"),
  profilePhoto: z.string().url("Profile photo must be a valid URL").or(z.string().optional()),
  specialties: z.array(z.string()).min(1, "Select at least one specialty"),
  licenseNumber: z.string().min(3, "License number is required"),
  medicalCouncilNumber: z.string().min(3, "Medical council number is required"),
  hospitalName: z.string().min(3, "Hospital or Clinic name is required"),
  yearsExperience: z.number().min(0, "Years of experience must be 0 or more"),
  bio: z.string().optional(),
  hourlyRate: z.number().min(0, "Hourly rate must be positive"),
  practicingCertificateUrl: z.string().url("Practicing certificate must be a valid URL"),
});

const SPECIALTIES_OPTIONS = ['Gynecology', 'Fertility', 'Obstetrics', "Women's Health", 'Other'];

export default async function CompleteProfilePage() {
  const token = (await cookies()).get("auth-token")?.value;
  let userId = '';
  
  if (token) {
    const payloadStr = token.replace("mock-jwt-", "").replace("mock-token-", "");
    try {
      if (token.startsWith("mock-jwt-")) {
        const decoded = JSON.parse(Buffer.from(payloadStr, "base64").toString("utf-8"));
        userId = decoded.id;
      } else {
        userId = payloadStr;
      }
    } catch (e) {
      userId = payloadStr;
    }
  }

  if (!userId) redirect("/login");

  const doctor = await getExpertByUserId(userId);
  if (!doctor) redirect("/login");

  // If they are already approved, send them to dashboard
  if (doctor.profile_status === 'approved') {
    redirect("/specialist/dashboard");
  }

  async function handleSubmit(formData: FormData) {
    "use server";
    
    const token = (await cookies()).get("auth-token")?.value;
    let userId = '';
    
    if (token) {
      const payloadStr = token.replace("mock-jwt-", "").replace("mock-token-", "");
      try {
        if (token.startsWith("mock-jwt-")) {
          const decoded = JSON.parse(Buffer.from(payloadStr, "base64").toString("utf-8"));
          userId = decoded.id;
        } else {
          userId = payloadStr;
        }
      } catch (e) {
        userId = payloadStr;
      }
    }

    if (!userId) redirect("/login");

    const doctor = await getExpertByUserId(userId);
    if (!doctor) redirect("/login");

    // Extract fields
    const display_name = formData.get("displayName") as string;
    const phone_number = formData.get("phoneNumber") as string;
    const profile_photo = formData.get("profilePhoto") as string;
    const license_number = formData.get("licenseNumber") as string;
    const medical_council_number = formData.get("medicalCouncilNumber") as string;
    const hospital_name = formData.get("hospitalName") as string;
    const years_of_experience = Number(formData.get("yearsExperience"));
    const hourly_rate = Number(formData.get("hourlyRate"));
    const practicing_certificate_url = formData.get("practicingCertificateUrl") as string;
    const bio = formData.get("bio") as string;

    // Specialties arrays are posted as individual items or JSON
    const selectedSpecialties = formData.getAll("specialties") as string[];

    // Validate using Zod
    try {
      completeProfileSchema.parse({
        displayName: display_name,
        phoneNumber: phone_number,
        profilePhoto: profile_photo || undefined,
        specialties: selectedSpecialties,
        licenseNumber: license_number,
        medicalCouncilNumber: medical_council_number,
        hospitalName: hospital_name,
        yearsExperience: years_of_experience,
        bio: bio || undefined,
        hourlyRate: hourly_rate,
        practicingCertificateUrl: practicing_certificate_url,
      });
    } catch (err: any) {
      // In Server Components/Actions, we can throw or handle it
      console.error("Validation failed:", err.errors);
      return { success: false, error: "Validation failed. Please check all fields." };
    }

    // 1. Update Profile (phone number)
    await updateProfile(userId, {
      phone_number: phone_number,
    });

    // 2. Update Expert
    await updateExpert(doctor.id, {
      display_name: display_name,
      specialties: JSON.stringify(selectedSpecialties),
      license_number: license_number,
      medical_council_number: medical_council_number,
      hospital_name: hospital_name,
      years_of_experience: years_of_experience,
      hourly_rate: hourly_rate,
      practicing_certificate_url: practicing_certificate_url,
      bio: bio,
      avatar_url: profile_photo || null,
      profile_status: 'pending_review',
      submitted_for_review_at: new Date().toISOString(),
    });

    // 3. Create Notification
    await createNotification(userId, "Your credentials have been submitted for review.", "info");

    // 4. Update the auth JWT cookie so they have pending_review status in session
    const payload = Buffer.from(JSON.stringify({
      id: userId,
      role: 'expert',
      status: 'pending_review'
    })).toString('base64');
    
    (await cookies()).set("auth-token", `mock-jwt-${payload}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    revalidatePath("/specialist/dashboard");
    redirect("/specialist/dashboard");
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 py-6">
      
      {/* Visual Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
          <Stethoscope size={32} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Complete Your Professional Profile</h1>
          <p className="text-slate-500 mt-1">Provide your credentials to get verified and unlock full clinical workspace features.</p>
        </div>
      </div>

      <CompleteProfileForm doctor={doctor} submitAction={handleSubmit} />
    </div>
  );
}
