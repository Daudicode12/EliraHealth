import { getExpertByUserId } from "@/lib/db/queries";
import { getSpecialistDashboardStats } from "@/lib/db/specialistQueries";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function DoctorDashboard() {
  // Get userId from cookie (matching your middleware/auth implementation)
  const token = (await cookies()).get("auth-token")?.value;
  const userId = token?.replace("mock-token-", "");

  if (!userId) redirect("/login");

  const doctor = await getExpertByUserId(userId);
  if (!doctor) redirect("/login");

  const stats = await getSpecialistDashboardStats(doctor.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Welcome, {doctor.display_name}</h1>
        <p className="text-sm text-muted-foreground">{JSON.parse(doctor.specialties || '[]').join(', ')}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {[
          { label: "Total Patients", value: stats.totalAssignedPatients },
          { label: "Total Consults", value: stats.totalConsultations },
          { label: "Pending", value: stats.pendingConsultations },
          { label: "Completed", value: stats.completedConsultations },
          { label: "Med Records", value: stats.totalMedicalRecords },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-2xl font-semibold mt-1">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="p-6 border rounded-xl bg-gray-50 flex flex-col items-center justify-center text-center space-y-3">
          <h3 className="font-semibold text-gray-900">Manage Patients</h3>
          <p className="text-sm text-gray-500 max-w-xs">View your assigned patients and access their comprehensive medical history.</p>
          <a href="/doctor/patients" className="mt-2 text-sm font-medium bg-white border px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">Go to Patients</a>
        </div>
        <div className="p-6 border rounded-xl bg-gray-50 flex flex-col items-center justify-center text-center space-y-3">
          <h3 className="font-semibold text-gray-900">Medical Records</h3>
          <p className="text-sm text-gray-500 max-w-xs">Create new treatment plans, prescribe medication, and update diagnoses.</p>
          <a href="/doctor/medical-records" className="mt-2 text-sm font-medium bg-white border px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">Go to Records</a>
        </div>
      </div>
    </div>
  );
}
