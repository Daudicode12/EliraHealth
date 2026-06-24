// src/app/specialist/profile/complete/page.tsx
import { getExpertByUserId, updateExpert, updateProfile, createNotification } from "@/lib/db/queries";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Stethoscope, Award, FileCheck, CheckCircle2, LogOut } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth.actions";
import { z } from "zod";

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
      return; // Or we can throw an error to show in form
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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-slate-900 text-white py-4 px-6 md:px-8 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2 font-bold text-lg">
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white p-1.5 rounded-lg shadow-lg">
            <Stethoscope size={20} />
          </div>
          Elira Specialist Onboarding
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white rounded-xl transition-all cursor-pointer"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </form>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 py-10 px-4 md:px-0">
        
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

        {/* Profile Form */}
        <form action={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
          
          {/* Section 1: Basic Info */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b pb-2 mb-4">
              <CheckCircle2 size={18} className="text-purple-600" />
              1. Clinical Identity
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Display Name (Dr. First Last)</label>
                <input
                  type="text"
                  name="displayName"
                  defaultValue={doctor.display_name || ""}
                  required
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl shadow-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all text-sm"
                  placeholder="Dr. Jane Smith"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Phone Number</label>
                <input
                  type="text"
                  name="phoneNumber"
                  required
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl shadow-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all text-sm"
                  placeholder="+254712345678"
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700">Profile Photo URL</label>
                <input
                  type="url"
                  name="profilePhoto"
                  defaultValue={doctor.avatar_url || ""}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl shadow-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all text-sm"
                  placeholder="https://example.com/photo.jpg"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Specialties */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b pb-2 mb-4">
              <Award size={18} className="text-purple-600" />
              2. Medical Specialties
            </h2>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Select Specialties (Choose one or more)</label>
              <div className="flex flex-wrap gap-3">
                {SPECIALTIES_OPTIONS.map((specialty) => {
                  const isChecked = Array.isArray(doctor.specialties) 
                    ? doctor.specialties.includes(specialty)
                    : false;
                  return (
                    <label
                      key={specialty}
                      className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer text-sm font-medium transition-all"
                    >
                      <input
                        type="checkbox"
                        name="specialties"
                        value={specialty}
                        defaultChecked={isChecked}
                        className="accent-purple-600 rounded"
                      />
                      {specialty}
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 3: Credentials */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b pb-2 mb-4">
              <FileCheck size={18} className="text-purple-600" />
              3. Verification & Credentials
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Medical License Number</label>
                <input
                  type="text"
                  name="licenseNumber"
                  defaultValue={doctor.license_number || ""}
                  required
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl shadow-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all text-sm"
                  placeholder="e.g. LIC-98765"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Medical Council Number</label>
                <input
                  type="text"
                  name="medicalCouncilNumber"
                  defaultValue={doctor.medical_council_number || ""}
                  required
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl shadow-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all text-sm"
                  placeholder="e.g. MC-12345"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Hospital / Clinic</label>
                <input
                  type="text"
                  name="hospitalName"
                  defaultValue={doctor.hospital_name || ""}
                  required
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl shadow-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all text-sm"
                  placeholder="e.g. Nairobi Hospital"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Practicing Certificate URL</label>
                <input
                  type="url"
                  name="practicingCertificateUrl"
                  defaultValue={doctor.practicing_certificate_url || ""}
                  required
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl shadow-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all text-sm"
                  placeholder="https://example.com/certificate.pdf"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Years of Experience</label>
                <input
                  type="number"
                  name="yearsExperience"
                  defaultValue={doctor.years_of_experience || ""}
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl shadow-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all text-sm"
                  placeholder="e.g. 8"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Hourly Rate (KES)</label>
                <input
                  type="number"
                  name="hourlyRate"
                  defaultValue={doctor.hourly_rate || ""}
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl shadow-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all text-sm"
                  placeholder="e.g. 3000"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Biography */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b pb-2 mb-4">
              <Award size={18} className="text-purple-600" />
              4. Clinical Biography
            </h2>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Bio (Optional)</label>
              <textarea
                name="bio"
                rows={4}
                defaultValue={doctor.bio || ""}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl shadow-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all text-sm resize-none"
                placeholder="Tell us about your medical background..."
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex gap-4 justify-end pt-4 border-t">
            <button
              type="submit"
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors text-sm shadow-sm flex items-center justify-center cursor-pointer"
            >
              Submit for Review
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
