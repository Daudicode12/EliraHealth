import { getExpertByUserId, updateExpert } from "@/lib/db/queries";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export default async function ProfilePage() {
  const token = (await cookies()).get("auth-token")?.value;
  let userId = token?.replace("mock-token-", "");
  if (token?.startsWith("mock-jwt-")) {
    try {
      const decoded = JSON.parse(Buffer.from(token.replace("mock-jwt-", ""), "base64").toString("utf-8"));
      userId = decoded.id;
    } catch(e) {}
  }

  if (!userId) redirect("/login");

  const doctor = await getExpertByUserId(userId);
  if (!doctor) redirect("/login");

  async function updateProfile(formData: FormData) {
    "use server";
    const token = (await cookies()).get("auth-token")?.value;
    let userId = token?.replace("mock-token-", "");
  if (token?.startsWith("mock-jwt-")) {
    try {
      const decoded = JSON.parse(Buffer.from(token.replace("mock-jwt-", ""), "base64").toString("utf-8"));
      userId = decoded.id;
    } catch(e) {}
  }
    if (!userId) return;
    
    const doctor = await getExpertByUserId(userId);
    if (!doctor) return;

    await updateExpert(doctor.id, {
      bio: formData.get("bio") as string,
      hospital_name: formData.get("hospital") as string,
      hourly_rate: Number(formData.get("hourly_rate")),
      years_of_experience: Number(formData.get("years_of_experience")),
    });
    
    revalidatePath("/specialist/profile");
  }

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-xl font-semibold">Profile</h1>
      <form action={updateProfile} className="space-y-4">
        {[
          { name: "hospital", label: "Hospital", defaultValue: doctor.hospital_name ?? "" },
          { name: "years_of_experience", label: "Years of Experience", defaultValue: String(doctor.years_of_experience) },
          { name: "hourly_rate", label: "Hourly Rate (KES)", defaultValue: String(doctor.hourly_rate) },
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
