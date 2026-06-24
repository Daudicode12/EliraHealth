import { getMedicalRecords, createMedicalRecord } from "@/lib/db/specialistQueries";
import { getExpertByUserId } from "@/lib/db/queries";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { FileText } from "lucide-react";
import { revalidatePath } from "next/cache";

export default async function MedicalRecordsPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string }>;
}) {
  const resolvedParams = await searchParams;
  const newPatientId = resolvedParams.new;

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

  const records = await getMedicalRecords(doctor.id) as any[];

  async function handleCreateRecord(formData: FormData) {
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
    
    const doc = await getExpertByUserId(userId);
    if (!doc) return;

    await createMedicalRecord({
      patient_id: formData.get("patient_id") as string,
      specialist_id: doc.id,
      diagnosis: formData.get("diagnosis") as string,
      treatment_plan: formData.get("treatment_plan") as string,
      prescription: formData.get("prescription") as string,
      notes: formData.get("notes") as string,
    });

    revalidatePath("/specialist/medical-records");
    redirect("/specialist/medical-records");
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Medical Records</h1>
      </div>

      {newPatientId && (
        <div className="bg-white p-6 rounded-xl border shadow-sm mb-8">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">Create New Medical Record</h2>
          <form action={handleCreateRecord} className="space-y-4">
            <input type="hidden" name="patient_id" value={newPatientId} />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis *</label>
              <input 
                type="text" 
                name="diagnosis" 
                required 
                className="w-full rounded-md border bg-gray-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                placeholder="e.g. Hypertension, Routine Checkup"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Treatment Plan</label>
              <textarea 
                name="treatment_plan" 
                rows={3} 
                className="w-full rounded-md border bg-gray-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                placeholder="Details of the treatment..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prescription</label>
              <textarea 
                name="prescription" 
                rows={2} 
                className="w-full rounded-md border bg-gray-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                placeholder="Medication names and dosages..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
              <textarea 
                name="notes" 
                rows={2} 
                className="w-full rounded-md border bg-gray-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <a href="/specialist/medical-records" className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                Cancel
              </a>
              <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 text-sm font-medium rounded-md transition-colors">
                Save Record
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-xl border bg-card overflow-hidden">
        {records.length === 0 ? (
          <div className="p-12 text-center border-dashed border-b-0 border-x-0">
            <p className="text-gray-500">No medical records found.</p>
          </div>
        ) : (
          <div className="divide-y">
            {records.map((record) => (
              <div key={record.id} className="p-5 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <FileText size={18} className="text-purple-600" />
                    <h3 className="font-medium text-gray-900">{record.diagnosis}</h3>
                  </div>
                  <span className="text-xs text-gray-500">{new Date(record.created_at).toLocaleDateString()}</span>
                </div>
                
                <p className="text-sm text-gray-600 mb-3 ml-6">
                  <span className="font-medium text-gray-700">Patient:</span> {record.first_name} {record.last_name}
                </p>

                <div className="ml-6 space-y-2 text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                  {record.treatment_plan && (
                    <div>
                      <span className="font-semibold text-gray-700 block text-xs uppercase tracking-wider mb-0.5">Treatment Plan</span>
                      <p>{record.treatment_plan}</p>
                    </div>
                  )}
                  {record.prescription && (
                    <div className="pt-2 border-t border-gray-50">
                      <span className="font-semibold text-gray-700 block text-xs uppercase tracking-wider mb-0.5">Prescription</span>
                      <p>{record.prescription}</p>
                    </div>
                  )}
                  {record.notes && (
                    <div className="pt-2 border-t border-gray-50">
                      <span className="font-semibold text-gray-700 block text-xs uppercase tracking-wider mb-0.5">Notes</span>
                      <p>{record.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
