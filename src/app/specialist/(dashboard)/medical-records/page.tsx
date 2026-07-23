import { getMedicalRecords, createMedicalRecord, getAssignedPatients } from "@/lib/db/specialistQueries";
import { getExpertByUserId } from "@/lib/db/queries";
import { redirect } from "next/navigation";
import { FileText, Plus, User, ClipboardList, Calendar } from "lucide-react";
import { revalidatePath } from "next/cache";
import { getServerSession } from "@/lib/auth/session";

export default async function MedicalRecordsPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string; id?: string }>;
}) {
  const resolvedParams = await searchParams;
  const newPatientId = resolvedParams.new;
  const filterRecordId = resolvedParams.id;

  const session = await getServerSession();
  if (!session) redirect("/login");

  const doctor = await getExpertByUserId(session.id);
  if (!doctor) redirect("/login");

  const [records, patients] = await Promise.all([
    getMedicalRecords(doctor.id) as Promise<any[]>,
    getAssignedPatients(doctor.id) as Promise<any[]>
  ]);

  async function handleCreateRecord(formData: FormData) {
    "use server";
    const session = await getServerSession();
    if (!session) return;

    const doc = await getExpertByUserId(session.id);
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

  const selectedPatient = patients.find(p => p.id === newPatientId);

  // If a specific record ID is provided, filter or sort to show it first
  const sortedRecords = [...records].sort((a, b) => {
    if (a.id === filterRecordId) return -1;
    if (b.id === filterRecordId) return 1;
    return 0;
  });

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Banner */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <ClipboardList className="text-brand" />
            Medical Records
          </h1>
          <p className="text-slate-500 text-sm mt-1">Document diagnoses, prescriptions, and clinical treatment plans.</p>
        </div>
        {!newPatientId && (
          <a 
            href="/specialist/medical-records?new=select" 
            className="inline-flex items-center gap-1.5 bg-brand hover:bg-brand-deep text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all"
          >
            <Plus size={16} />
            Create Record
          </a>
        )}
      </div>

      {/* Info notice when filtering by ID */}
      {filterRecordId && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-center justify-between text-sm text-blue-900 font-medium">
          <span className="flex items-center gap-2">
            ℹ️ Highlighted record is selected from the patient's history.
          </span>
          <a href="/specialist/medical-records" className="text-blue-700 hover:text-blue-900 font-bold underline transition-colors">
            Clear Highlight
          </a>
        </div>
      )}

      {/* Record Creation Panel */}
      {newPatientId && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm animate-in fade-in duration-300">
          <h2 className="text-lg font-bold text-slate-900 mb-6 border-b pb-3 flex items-center gap-2">
            <FileText size={20} className="text-brand" />
            Create New Medical Record
          </h2>
          <form action={handleCreateRecord} className="space-y-5">
            
            {/* Patient Selection Logic */}
            {newPatientId === "select" ? (
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Select Patient *</label>
                <select 
                  name="patient_id" 
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 focus:bg-white transition-all"
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.first_name} {p.last_name} ({p.email || p.phone_number})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-1.5">
                <input type="hidden" name="patient_id" value={newPatientId} />
                <label className="text-sm font-semibold text-slate-500">Patient</label>
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-800">
                  <User size={16} className="text-slate-400" />
                  {selectedPatient ? `${selectedPatient.first_name} ${selectedPatient.last_name}` : "Selected Patient"}
                </div>
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Diagnosis *</label>
              <input 
                type="text" 
                name="diagnosis" 
                required 
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 focus:bg-white transition-all"
                placeholder="e.g. Prenatal checkup, post-partum fatigue management"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Treatment Plan</label>
              <textarea 
                name="treatment_plan" 
                rows={3} 
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 focus:bg-white transition-all resize-none"
                placeholder="Detail clinical recommendations, dietary changes, exercises..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Prescription</label>
              <textarea 
                name="prescription" 
                rows={2} 
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 focus:bg-white transition-all resize-none"
                placeholder="Medication name, dosage, frequency..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Additional Notes</label>
              <textarea 
                name="notes" 
                rows={2} 
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 focus:bg-white transition-all resize-none"
                placeholder="Clinical observations or remarks..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <a href="/specialist/medical-records" className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-xl transition-all cursor-pointer">
                Cancel
              </a>
              <button type="submit" className="bg-brand hover:bg-brand-deep text-white px-5 py-2.5 text-sm font-semibold rounded-xl transition-all cursor-pointer shadow-sm">
                Save Record
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Records Listing */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {sortedRecords.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <FileText className="text-slate-400" size={28} />
            </div>
            <h3 className="text-slate-900 font-bold">No medical records</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
              You haven't recorded any diagnoses or prescriptions yet.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sortedRecords.map((record) => {
              const isHighlighted = record.id === filterRecordId;
              return (
                <div 
                  key={record.id} 
                  className={`p-6 transition-all border-l-4 ${
                    isHighlighted 
                      ? "bg-blue-50/40 border-l-blue-600 shadow-sm" 
                      : "hover:bg-slate-50/50 border-l-transparent"
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                        <FileText size={18} className={isHighlighted ? "text-blue-600" : "text-brand"} />
                        {record.diagnosis}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1 font-semibold">
                        Patient: <span className="text-slate-800">{record.first_name} {record.last_name}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-400 font-semibold bg-slate-50 px-2.5 py-1 rounded-full border">
                      <Calendar size={12} />
                      {new Date(record.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="space-y-3 text-sm text-slate-600 bg-white p-4 rounded-xl border border-slate-200/60 mt-4 shadow-xs">
                    {record.treatment_plan && (
                      <div>
                        <span className="font-bold text-slate-400 block text-[10px] uppercase tracking-wider mb-1">Treatment Plan</span>
                        <p className="text-slate-800 leading-relaxed font-medium">{record.treatment_plan}</p>
                      </div>
                    )}
                    {record.prescription && (
                      <div className="pt-3 border-t border-slate-200/50">
                        <span className="font-bold text-slate-400 block text-[10px] uppercase tracking-wider mb-1">Prescription</span>
                        <p className="text-slate-800 font-medium">{record.prescription}</p>
                      </div>
                    )}
                    {record.notes && (
                      <div className="pt-3 border-t border-slate-200/50">
                        <span className="font-bold text-slate-400 block text-[10px] uppercase tracking-wider mb-1">Clinical Notes</span>
                        <p className="text-slate-800 leading-relaxed font-medium">{record.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
