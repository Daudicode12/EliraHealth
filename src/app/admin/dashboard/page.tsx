import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminDashboard() {
  const supabase = await createSupabaseServerClient();

  const [{ count: totalDoctors }, { count: pending }, { count: consultations }] =
    await Promise.all([
      supabase.from("doctors").select("*", { count: "exact", head: true }),
      supabase
        .from("doctors")
        .select("*", { count: "exact", head: true })
        .eq("verification_status", "PENDING"),
      supabase.from("consultations").select("*", { count: "exact", head: true }),
    ]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Admin Dashboard</h1>
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Doctors", value: totalDoctors ?? 0 },
          { label: "Pending Verification", value: pending ?? 0 },
          { label: "Total Consultations", value: consultations ?? 0 },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-2xl font-semibold mt-1">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
