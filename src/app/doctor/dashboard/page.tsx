import { getExpertByUserId, getExpertConsultations } from "@/lib/db/queries";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function DoctorDashboard() {
  // Get userId from cookie (matching your middleware/auth implementation)
  const token = (await cookies()).get("auth-token")?.value;
  const userId = token?.replace("mock-token-", "");

  if (!userId) redirect("/login");

  const doctor = await getExpertByUserId(userId);
  if (!doctor) redirect("/login");

  const consultations = await getExpertConsultations(doctor.id);

  const stats = {
    total: consultations.length,
    pending: consultations.filter((c) => c.status === "pending").length,
    active: consultations.filter((c) => c.status === "in_progress" || c.status === "confirmed").length,
    completed: consultations.filter((c) => c.status === "completed").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Welcome, {doctor.display_name}</h1>
        <p className="text-sm text-muted-foreground">{JSON.parse(doctor.specialties || '[]').join(', ')}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total", value: stats.total },
          { label: "Pending", value: stats.pending },
          { label: "Active", value: stats.active },
          { label: "Completed", value: stats.completed },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-2xl font-semibold mt-1">{value}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-sm font-medium mb-3">Recent Consultations</h2>
        {consultations.length === 0 ? (
          <p className="text-sm text-muted-foreground">No consultations yet.</p>
        ) : (
          <div className="rounded-xl border divide-y overflow-hidden">
            {consultations.slice(0, 10).map((c) => (
              <div key={c.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <p className="font-medium">{c.issue_category || 'General Consultation'}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.first_name} {c.last_name} · {c.scheduled_at ? new Date(c.scheduled_at).toLocaleDateString() : 'Not scheduled'}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    c.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : c.status === "in_progress" || c.status === "confirmed"
                      ? "bg-blue-100 text-blue-700"
                      : c.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {c.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
