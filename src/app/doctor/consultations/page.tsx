import { getExpertByUserId, getExpertConsultations } from "@/lib/db/queries";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  in_progress: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  no_show: "bg-gray-100 text-gray-700",
};

export default async function ConsultationsPage() {
  const token = (await cookies()).get("auth-token")?.value;
  const userId = token?.replace("mock-token-", "");

  if (!userId) redirect("/login");

  const doctor = await getExpertByUserId(userId);
  if (!doctor) redirect("/login");

  const consultations = await getExpertConsultations(doctor.id);

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
                <p className="text-sm font-medium">{c.issue_category || 'General Consultation'}</p>
                <p className="text-xs text-muted-foreground">{c.issue_description}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Patient: {c.first_name} {c.last_name} · {c.scheduled_at ? new Date(c.scheduled_at).toLocaleString() : 'Not scheduled'}
                </p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[c.status] || "bg-gray-100 text-gray-700"}`}>
                {c.status.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
