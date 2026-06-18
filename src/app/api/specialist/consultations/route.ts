import { NextRequest, NextResponse } from "next/server";
import { requireSpecialist } from "@/lib/auth/specialist";
import { createConsultation, getExpertConsultations } from "@/lib/db/queries";
import { ensurePatientAssignment } from "@/lib/db/specialistQueries";
import { CreateConsultationSchema } from "@/lib/types/specialist";

export async function GET(req: NextRequest) {
  const auth = await requireSpecialist(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const consultations = await getExpertConsultations(auth.specialistId);
    return NextResponse.json({ success: true, data: consultations });
  } catch (error) {
    console.error("Fetch Consultations Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch consultations" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireSpecialist(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const validatedData = CreateConsultationSchema.parse(body);

    // Verify the specialist is booking for themselves
    if (validatedData.specialist_id !== auth.specialistId) {
      return NextResponse.json({ success: false, error: "Cannot book consultation for another specialist" }, { status: 403 });
    }

    // Ensure they are assigned
    await ensurePatientAssignment(auth.specialistId, validatedData.patient_id);

    const consultationId = await createConsultation({
      client_id: validatedData.patient_id,
      expert_id: auth.specialistId,
      scheduled_at: validatedData.scheduled_at,
      issue_category: validatedData.issue_category,
      issue_description: validatedData.issue_description,
    });

    return NextResponse.json({ success: true, data: { id: consultationId } }, { status: 201 });
  } catch (error: any) {
    console.error("Create Consultation Error:", error);
    if (error.issues) {
      return NextResponse.json({ success: false, error: "Validation failed", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
