import { getPatientDetailsForSpecialist } from "@/lib/db/specialistQueries";
import { getExpertByUserId } from "@/lib/db/queries";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, Calendar } from "lucide-react";
import { getServerSession } from "@/lib/auth/session";

export default async function PatientDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: patientId } = await params;

  const session = await getServerSession();
  if (!session) redirect("/login");

  const doctor = await getExpertByUserId(session.id);
  if (!doctor) redirect("/login");

  const details = await getPatientDetailsForSpecialist(doctor.id, patientId);

  if (!details) {
    return (
      <div className="p-12 text-center border rounded-xl bg-gray-50 border-dashed">
        <p className="text-gray-500">Patient not found or you don't have access.</p>
        <Link href="/specialist/patients" className="text-brand hover:underline mt-4 inline-block">Back to Patients</Link>
      </div>
    );
  }

  const { patient, assignment, recentConsultations, medicalRecordsSummary } = details as any;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-4">
        <Link href="/specialist/patients" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Patient Profile</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Patient Details Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="rounded-xl border bg-card p-5">
            <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center text-brand text-xl font-bold mb-4">
              {patient.first_name?.charAt(0)}{patient.last_name?.charAt(0)}
            </div>
            <h2 className="text-xl font-semibold mb-1">{patient.first_name} {patient.last_name}</h2>
            <p className="text-sm text-gray-500 mb-6">{patient.email}</p>

            <div className="space-y-3 pt-4 border-t">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Phone</p>
                <p className="text-sm font-medium">{patient.phone_number || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">DOB</p>
                <p className="text-sm font-medium">{patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Height</p>
                  <p className="text-sm font-medium">{patient.height ? `${patient.height} cm` : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Weight</p>
                  <p className="text-sm font-medium">{patient.weight ? `${patient.weight} kg` : 'N/A'}</p>
                </div>
              </div>
              <div className="pt-2">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Assignment Status</p>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  assignment?.status === 'active' ? 'bg-brand/10 text-brand' : 'bg-gray-100 text-gray-700'
                }`}>
                  {assignment?.status || 'Unknown'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* History & Records */}
        <div className="md:col-span-2 space-y-6">
          {/* Consultations */}
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Calendar size={18} className="text-gray-500" />
                Recent Consultations
              </h3>
            </div>
            <div className="p-0">
              {recentConsultations.length === 0 ? (
                <p className="text-sm text-gray-500 p-4">No recent consultations.</p>
              ) : (
                <div className="divide-y">
                  {recentConsultations.map((c: any) => (
                    <div key={c.id} className="p-4 hover:bg-gray-50 transition-colors flex justify-between items-center">
                      <div>
                        <p className="font-medium text-sm">{c.issue_category}</p>
                        <p className="text-xs text-gray-500">{c.scheduled_at ? new Date(c.scheduled_at).toLocaleString() : 'Unscheduled'}</p>
                        {c.diagnosis && <p className="text-xs text-gray-600 mt-1">Diagnosis: {c.diagnosis}</p>}
                      </div>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md uppercase font-medium tracking-wider">
                        {c.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Medical Records */}
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <FileText size={18} className="text-gray-500" />
                Medical Records
              </h3>
              <Link 
                href={`/specialist/medical-records?new=${patientId}`}
                className="text-xs font-medium text-brand hover:text-brand-deep bg-brand-light/40 hover:bg-brand-light/60 px-3 py-1.5 rounded-md transition-colors"
              >
                + New Record
              </Link>
            </div>
            <div className="p-0">
              {medicalRecordsSummary.length === 0 ? (
                <p className="text-sm text-gray-500 p-4">No medical records found.</p>
              ) : (
                <div className="divide-y">
                  {medicalRecordsSummary.map((record: any) => (
                    <div key={record.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-medium text-sm">{record.diagnosis}</p>
                        <p className="text-xs text-gray-500">{new Date(record.created_at).toLocaleDateString()}</p>
                      </div>
                      <Link href={`/specialist/medical-records?id=${record.id}`} className="text-xs text-brand hover:underline">
                        View Full Record
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
