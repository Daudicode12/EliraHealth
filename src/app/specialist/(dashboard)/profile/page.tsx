import { getExpertByUserId, getProfileById, updateExpert, updateProfile, createNotification } from "@/lib/db/queries";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ProfileForm } from "../../profile/ProfileForm";
import { ShieldCheck } from "lucide-react";
import { getServerSession } from "@/lib/auth/server-session";
import { signAccessToken } from "@/lib/auth/jwt";

export default async function ProfilePage() {
  const token = (await cookies()).get("auth-token")?.value;
  const session = await getServerSession();
  const userId = session?.userId;

  if (!userId) redirect("/login");

  const doctor = await getExpertByUserId(userId);
  if (!doctor) redirect("/login");

  const userProfile = await getProfileById(userId);

  async function handleProfileUpdate(formData: FormData) {
    "use server";
    try {
      const action = formData.get("action") as string; // 'save' or 'submit'
      
      const token = (await cookies()).get("auth-token")?.value;
      const session = await getServerSession();
      const actionUserId = session?.userId;
      if (!actionUserId) return { success: false, error: "Unauthorized" };
      
      const doc = await getExpertByUserId(actionUserId);
      if (!doc) return { success: false, error: "Profile not found" };

      // Get fields
      const display_name = formData.get("display_name") as string;
      const phone_number = formData.get("phone_number") as string;
      const avatar_url = formData.get("avatar_url") as string;
      const license_number = formData.get("license_number") as string;
      const medical_council_number = formData.get("medical_council_number") as string;
      const hospital_name = formData.get("hospital_name") as string;
      const practicing_certificate_url = formData.get("practicing_certificate_url") as string;
      const bio = formData.get("bio") as string;
      
      const specialties = formData.getAll("specialties") as string[];
      const years_of_experience = formData.get("years_of_experience") ? Number(formData.get("years_of_experience")) : null;
      const hourly_rate = formData.get("hourly_rate") ? Number(formData.get("hourly_rate")) : null;

      // Base updates for profile (phone & split name)
      const firstName = display_name ? display_name.split(" ")[0] : "";
      const lastName = display_name && display_name.split(" ").length > 1 ? display_name.split(" ").slice(1).join(" ") : "";
      
      await updateProfile(actionUserId, {
        phone_number,
        first_name: firstName,
        last_name: lastName,
      });

      const expertUpdates: any = {
        display_name,
        avatar_url,
        license_number,
        medical_council_number,
        hospital_name,
        practicing_certificate_url,
        bio,
        specialties: specialties.length > 0 ? JSON.stringify(specialties) : doc.specialties,
        years_of_experience,
        hourly_rate,
      };

      if (action === 'submit') {
        expertUpdates.profile_status = 'pending_review';
        expertUpdates.submitted_for_review_at = new Date().toISOString();
        await createNotification(actionUserId, "Your credentials have been submitted for review.", "info");

        // Update auth token status to pending_review
        const newToken = signAccessToken({
          userId: actionUserId,
          email: null,
          role: 'expert',
          status: 'pending_review'
        });
        (await cookies()).set("auth-token", newToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
        });
      }

      await updateExpert(doc.id, expertUpdates);
      
      revalidatePath("/specialist/profile");
      revalidatePath("/specialist/dashboard");
      return { success: true, submitted: action === 'submit' };
    } catch (err) {
      console.error(err);
      return { success: false, error: "Failed to update profile." };
    }
  }

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          My Profile
          {doctor.profile_status === 'approved' && (
            <span className="flex items-center gap-1 text-sm bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full border border-emerald-500/20 shadow-sm">
              <ShieldCheck size={16} />
              Verified Expert
            </span>
          )}
        </h1>
        <p className="text-slate-500 mt-2">Manage your personal and clinical profile information.</p>
      </div>

      <ProfileForm 
        doctor={JSON.parse(JSON.stringify(doctor))} 
        userProfile={userProfile ? JSON.parse(JSON.stringify(userProfile)) : null} 
        updateAction={handleProfileUpdate} 
      />
    </div>
  );
}
