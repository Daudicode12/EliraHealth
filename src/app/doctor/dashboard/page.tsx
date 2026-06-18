import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDoctorByUserId } from "@/lib/services/doctorService";
import { getConsultationsByDoctor } from "@/lib/services/consultationService";
import { redirect } from "next/navigation";

export default async function DoctorDashboard() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const doctor = await getDoctorByUserId(user.id);
  if (!doctor) redirect("/login");

  const consultations = await getConsultationsByDoctor(doctor.id);

  const stats = {
    total: consultations.length,
    pending: consultations.filter((c) => c.status === "PENDING").length,
    active: consultations.filter((c) => c.status === "ACTIVE").length,
    completed: consultations.filter((c) => c.status === "COMPLETED").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Welcome, Dr. {doctor.profiles.full_name}</h1>
        <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
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
                  <p className="font-medium">{c.topic}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(c.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    c.status === "PENDING"
                      ? "bg-yellow-100 text-yellow-700"
                      : c.status === "ACTIVE"
                      ? "bg-blue-100 text-blue-700"
                      : c.status === "COMPLETED"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
