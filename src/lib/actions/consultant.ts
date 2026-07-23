"use server";

import { signAccessToken } from '@/lib/auth/jwt';
import { getServerSession } from '@/lib/auth/server-session';

import { 
  createConsultation, 
  sendConsultationMessage, 
  createReview,
  getExpertByUserId,
  updateExpert,
  updateProfile,
  createNotification
} from "@/lib/db/queries";
import { Consultation } from "@/lib/db/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getServerSession, setSessionCookie } from "@/lib/auth/session";

// Zod Schema for validation (without licenseNumber & medicalCouncilNumber)
const completeProfileSchema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 characters"),
  profilePhoto: z.string().url("Profile photo must be a valid URL").or(z.string().optional()),
  specialties: z.array(z.string()).min(1, "Select at least one specialty"),
  subSpecialties: z.array(z.string()).min(1, "Select at least one focus area / sub-specialty"),
  languages: z.array(z.string()).min(1, "Select at least one language"),
  hospitalName: z.string().min(3, "Hospital or Clinic name is required"),
  yearsExperience: z.number().min(0, "Years of experience must be 0 or more"),
  bio: z.string().optional(),
  licenseNumber: z.string().min(3, "License number is required"),
  medicalCouncilNumber: z.string().min(3, "Medical council number is required"),
  hourlyRate: z.number().min(0, "Hourly rate must be 0 or more"),
  practicingCertificateUrl: z.string().url("Must be a valid URL").or(z.string().optional()),
});

export async function bookConsultation(data: Partial<Consultation>) {
  await createConsultation(data);
  revalidatePath("/user/dashboard");
  return { success: true };
}

export async function sendMessage(consultationId: string, senderId: string, content: string) {
  await sendConsultationMessage({
    consultation_id: consultationId,
    sender_id: senderId,
    content,
    message_type: 'text'
  });
  revalidatePath(`/consultations/${consultationId}`);
  return { success: true };
}

export async function submitReview(consultationId: string, clientId: string, expertId: string, rating: number, comment: string) {
  await createReview({
    consultation_id: consultationId,
    client_id: clientId,
    expert_id: expertId,
    rating,
    comment
  });
  revalidatePath(`/experts/${expertId}`);
  return { success: true };
}

export async function completeSpecialistOnboarding(data: {
  displayName: string;
  phoneNumber: string;
  profilePhoto?: string;
  specialties: string[];
  subSpecialties: string[];
  languages: string[];
  hospitalName: string;
  yearsExperience: number;
  bio?: string;
  licenseNumber: string;
  medicalCouncilNumber: string;
  hourlyRate: number;
  practicingCertificateUrl?: string;
}) {
  const session = await getServerSession();
  if (!session) {
    return { success: false, error: "Not authenticated" };
  }
  const userId = session.id;

  const doctor = await getExpertByUserId(userId);
  if (!doctor) {
    return { success: false, error: "Specialist record not found" };
  }

  // Validate using Zod
  try {
    completeProfileSchema.parse(data);
  } catch (err: any) {
    return { success: false, error: err.errors?.[0]?.message || "Validation failed" };
  }

  // 1. Update Profile (phone number)
  await updateProfile(userId, {
    phone_number: data.phoneNumber,
  });

  // 2. Update Expert
  await updateExpert(doctor.id, {
    display_name: data.displayName,
    specialties: JSON.stringify(data.specialties),
    sub_specialties: JSON.stringify(data.subSpecialties),
    languages: JSON.stringify(data.languages),
    hospital_name: data.hospitalName,
    years_of_experience: data.yearsExperience,
    hourly_rate: data.hourlyRate,
    license_number: data.licenseNumber,
    medical_council_number: data.medicalCouncilNumber,
    practicing_certificate_url: data.practicingCertificateUrl || null,
    bio: data.bio || null,
    avatar_url: data.profilePhoto || null,
    profile_status: 'pending_review',
    submitted_for_review_at: new Date().toISOString(),
  });

  // 3. Create Notification
  await createNotification(userId, "Your credentials have been submitted for review.", "info");

  // 4. Update the auth session cookie
  await setSessionCookie({ id: userId, role: 'expert', status: 'pending_review' });

  return { success: true };
}
