import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDoctorByUserId, updateDoctorProfile } from "@/lib/services/doctorService";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const doctor = await getDoctorByUserId(user.id);
  if (!doctor) redirect("/login");

  async function updateProfile(formData: FormData) {
    "use server";
    await updateDoctorProfile(doctor!.id, {
      bio: formData.get("bio") as string,
      hospital: formData.get("hospital") as string,
      consultation_fee: Number(formData.get("consultation_fee")),
      years_experience: Number(formData.get("years_experience")),
    });
  }

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-xl font-semibold">Profile</h1>
      <form action={updateProfile} className="space-y-4">
        {[
          { name: "hospital", label: "Hospital", defaultValue: doctor.hospital ?? "" },
          { name: "years_experience", label: "Years of Experience", defaultValue: String(doctor.years_experience) },
          { name: "consultation_fee", label: "Consultation Fee (KES)", defaultValue: String(doctor.consultation_fee) },
        ].map(({ name, label, defaultValue }) => (
          <div key={name} className="space-y-1">
            <label htmlFor={name} className="text-sm font-medium">{label}</label>
            <input
              id={name}
              name={name}
              defaultValue={defaultValue}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        ))}
        <div className="space-y-1">
          <label htmlFor="bio" className="text-sm font-medium">Bio</label>
          <textarea
            id="bio"
            name="bio"
            rows={4}
            defaultValue={doctor.bio ?? ""}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Save changes
        </button>
      </form>
    </div>
  );
}
