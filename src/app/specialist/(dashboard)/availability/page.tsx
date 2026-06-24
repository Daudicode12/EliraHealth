import { getExpertByUserId, getExpertAvailability, createAvailability, executeAction } from "@/lib/db/queries";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const DAYS_MAP = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default async function AvailabilityPage() {
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

  const availability = await getExpertAvailability(doctor.id);

  async function saveAvailability(formData: FormData) {
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

    // Delete existing availability first
    await executeAction("DELETE FROM expert_availability WHERE expert_id = ?", [doctor.id]);

    // Insert new slots
    for (let i = 0; i < DAYS_MAP.length; i++) {
      const day = DAYS_MAP[i];
      const start = formData.get(`${day}_start`) as string;
      const end = formData.get(`${day}_end`) as string;
      
      if (start && end) {
        await createAvailability({
          expert_id: doctor.id,
          day_of_week: i,
          start_time: start,
          end_time: end,
        });
      }
    }
    
    revalidatePath("/specialist/availability");
  }

  const existing = Object.fromEntries(
    availability.map((a) => [DAYS_MAP[a.day_of_week], { start: a.start_time, end: a.end_time }])
  );

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-xl font-semibold">Availability</h1>
      <form action={saveAvailability} className="space-y-3">
        {DAYS_MAP.map((day) => (
          <div key={day} className="flex items-center gap-3">
            <span className="w-28 text-sm">{day}</span>
            <input
              type="time"
              name={`${day}_start`}
              defaultValue={existing[day]?.start ?? ""}
              className="rounded-md border bg-background px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <span className="text-sm text-muted-foreground">to</span>
            <input
              type="time"
              name={`${day}_end`}
              defaultValue={existing[day]?.end ?? ""}
              className="rounded-md border bg-background px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        ))}
        <button
          type="submit"
          className="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Save availability
        </button>
      </form>
    </div>
  );
}
