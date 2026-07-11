import { getServerSession } from "@/lib/auth/server-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getExpertByUserId } from "@/lib/db/queries";
import { ConsultationService } from "@/services/consultation.service";
import { ConsultationDetailClient } from "./ConsultationDetailClient";
import Link from "next/link";

export default async function ConsultationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const token = (await cookies()).get("auth-token")?.value;
  const session = await getServerSession();
    let userId = session?.userId || 'system';
  if (!userId) redirect("/login");

  const doctor = await getExpertByUserId(userId);
  if (!doctor) redirect("/login");

  const consultation = await ConsultationService.getConsultationById(id);
  if (!consultation) {
    return (
      <div className="space-y-6">
        <Link href="/specialist/consultations" className="text-sm text-blue-600 hover:underline">← Back to Consultations</Link>
        <div className="p-16 text-center border rounded-xl bg-gray-50 border-dashed">
          <span className="text-4xl block mb-4">🔍</span>
          <p className="text-gray-500 font-medium">Consultation not found</p>
        </div>
      </div>
    );
  }

  // Security check
  if (consultation.specialist_id !== doctor.id) redirect("/specialist/consultations");

  const notes = await ConsultationService.getConsultationNotes(id);

  // Calculate patient age
  let patientAge: number | null = null;
  if (consultation.patient_date_of_birth) {
    try {
      const dob = new Date(consultation.patient_date_of_birth);
      const today = new Date();
      patientAge = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        patientAge--;
      }
    } catch {}
  }

  return (
    <ConsultationDetailClient
      consultation={consultation}
      notes={notes}
      patientAge={patientAge}
      specialistId={doctor.id}
    />
  );
}
