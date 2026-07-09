// src/app/specialist/profile/complete/page.tsx
import { getExpertByUserId } from "@/lib/db/queries";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import OnboardingWizard from "./OnboardingWizard";

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

  const plainDoctor = JSON.parse(JSON.stringify(doctor));

  return <OnboardingWizard doctor={plainDoctor} />;
}