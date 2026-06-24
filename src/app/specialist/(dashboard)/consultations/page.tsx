import { getExpertByUserId, getExpertConsultations, updateConsultationStatus } from "@/lib/db/queries";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

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

  const consultations = await getExpertConsultations(doctor.id);

  async function handleComplete(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await updateConsultationStatus(id, "completed");
    revalidatePath("/specialist/consultations");
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Consultations</h1>
      </div>

      {consultations.length === 0 ? (
        <div className="p-12 text-center border rounded-xl bg-gray-50 border-dashed">
          <p className="text-gray-500">No consultations yet.</p>
        </div>
      ) : (
        <div className="rounded-xl border divide-y overflow-hidden bg-white">
          {consultations.map((c) => (
            <div key={c.id} className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors">
              <div>
                <p className="text-base font-medium text-gray-900">{c.issue_category || 'General Consultation'}</p>
                <p className="text-sm text-gray-600 mt-1">{c.issue_description}</p>
                <div className="flex gap-4 mt-3">
                  <p className="text-xs text-gray-500 font-medium">
                    <span className="uppercase tracking-wider text-[10px] mr-1">Patient:</span> 
                    {c.first_name} {c.last_name}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">
                    <span className="uppercase tracking-wider text-[10px] mr-1">Schedule:</span> 
                    {c.scheduled_at ? new Date(c.scheduled_at).toLocaleString() : 'Not scheduled'}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${STATUS_STYLES[c.status] || "bg-gray-100 text-gray-700"}`}>
                  {c.status}
                </span>
                
                {(c.status === "in_progress" || c.status === "confirmed") && (
                  <form action={handleComplete}>
                    <input type="hidden" name="id" value={c.id} />
                    <button type="submit" className="text-xs font-medium text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-md transition-colors shadow-sm">
                      Mark Completed
                    </button>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
