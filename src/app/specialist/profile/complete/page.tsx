// src/app/specialist/profile/complete/page.tsx
import { getExpertByUserId } from "@/lib/db/queries";
import { redirect } from "next/navigation";
import OnboardingWizard from "./OnboardingWizard";
import { getServerSession } from "@/lib/auth/session";

export default async function CompleteProfilePage() {
  const session = await getServerSession();
  if (!session) redirect("/login");

  const doctor = await getExpertByUserId(session.id);
  if (!doctor) redirect("/login");

  // If they are already approved, send them to dashboard
  if (doctor.profile_status === 'approved') {
    redirect("/specialist/dashboard");
  }

  const plainDoctor = JSON.parse(JSON.stringify(doctor));

  return <OnboardingWizard doctor={plainDoctor} />;
}