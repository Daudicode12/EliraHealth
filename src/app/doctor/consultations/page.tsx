import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDoctorByUserId } from "@/lib/services/doctorService";
import { getConsultationsByDoctor } from "@/lib/services/consultationService";
import { redirect } from "next/navigation";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  ACTIVE: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

export default async function ConsultationsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const doctor = await getDoctorByUserId(user.id);
  if (!doctor) redirect("/login");

  const consultations = await getConsultationsByDoctor(doctor.id);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Consultations</h1>
      {consultations.length === 0 ? (
        <p className="text-sm text-muted-foreground">No consultations yet.</p>
      ) : (
        <div className="rounded-xl border divide-y overflow-hidden">
          {consultations.map((c) => (
            <div key={c.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium">{c.topic}</p>
                <p className="text-xs text-muted-foreground">{c.description}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {new Date(c.created_at).toLocaleString()}
                </p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[c.status]}`}>
                {c.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
