import { getServerSession } from '@/lib/auth/server-session';
// src/app/specialist/profile/complete/page.tsx
import { getExpertByUserId } from "@/lib/db/queries";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import OnboardingWizard from "./OnboardingWizard";

export default async function CompleteProfilePage() {
  const session = await getServerSession();
  const userId = session?.userId;

  if (!userId) redirect("/login");

  const doctor = await getExpertByUserId(userId);
  if (!doctor) redirect("/login");

  // If they are already approved, send them to dashboard
  if (doctor.profile_status === 'approved') {
    redirect("/specialist/dashboard");
  }

  const plainDoctor = JSON.parse(JSON.stringify(doctor));

  return <OnboardingWizard doctor={plainDoctor} />;
}