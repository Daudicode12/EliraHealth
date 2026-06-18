import { getMany, getOne } from "@/lib/db/queries";

export default async function AdminDashboard() {
  // Fetch counts from Turso
  const [
    totalDoctorsResult,
    pendingResult,
    consultationsResult
  ] = await Promise.all([
    getOne<{ count: number }>('SELECT COUNT(*) as count FROM experts'),
    getOne<{ count: number }>("SELECT COUNT(*) as count FROM experts WHERE is_verified = 0"),
    getOne<{ count: number }>("SELECT COUNT(*) as count FROM consultations")
  ]);

  const totalDoctors = totalDoctorsResult?.count ?? 0;
  const pending = pendingResult?.count ?? 0;
  const consultations = consultationsResult?.count ?? 0;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total Experts", value: totalDoctors },
          { label: "Pending Verification", value: pending },
          { label: "Total Consultations", value: consultations },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-2xl font-semibold mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* Placeholder for more admin features */}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
            Manage Experts
          </button>
          <button className="px-4 py-2 border rounded-md text-sm">
            Review Consultations
          </button>
        </div>
      </div>
    </div>
  );
}
