import { getServerSession } from "@/lib/auth/server-session";
import { getAssignedPatients } from "@/lib/db/specialistQueries";
import { getExpertByUserId } from "@/lib/db/queries";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserCircle } from "lucide-react";
import { getServerSession } from "@/lib/auth/session";

export default async function PatientsPage() {
  const session = await getServerSession();
  if (!session) redirect("/login");

  const doctor = await getExpertByUserId(session.id);
  if (!doctor) redirect("/login");

  const patients = await getAssignedPatients(doctor.id) as any[];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">My Patients</h1>
      </div>

      {patients.length === 0 ? (
        <div className="p-12 text-center border rounded-xl bg-gray-50 border-dashed">
          <p className="text-gray-500">You don't have any assigned patients yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.map((patient) => (
            <Link key={patient.id} href={`/specialist/patients/${patient.id}`}>
              <div className="rounded-xl border bg-card p-5 hover:shadow-md transition-all cursor-pointer h-full flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center text-brand">
                    <UserCircle size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{patient.first_name} {patient.last_name}</h3>
                    <p className="text-xs text-gray-500">Since {new Date(patient.assigned_at).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="mt-auto pt-4 border-t space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Email:</span>
                    <span className="font-medium truncate ml-2 max-w-[150px]" title={patient.email}>{patient.email}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Status:</span>
                    <span className={`font-medium px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${
                      patient.status === 'active' ? 'bg-brand/10 text-brand' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {patient.status}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
