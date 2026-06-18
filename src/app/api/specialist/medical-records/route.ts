import { NextRequest, NextResponse } from "next/server";
import { requireSpecialist } from "@/lib/auth/specialist";
import { createMedicalRecord, getMedicalRecords, ensurePatientAssignment } from "@/lib/db/specialistQueries";
import { CreateMedicalRecordSchema } from "@/lib/types/specialist";

export async function GET(req: NextRequest) {
  const auth = await requireSpecialist(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const records = await getMedicalRecords(auth.specialistId);
    return NextResponse.json({ success: true, data: records });
  } catch (error) {
    console.error("Fetch Medical Records Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch medical records" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireSpecialist(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const validatedData = CreateMedicalRecordSchema.parse(body);

    // Implicitly ensure the patient is assigned to this specialist when a record is created
    await ensurePatientAssignment(auth.specialistId, validatedData.patient_id);

    const recordId = await createMedicalRecord({
      patient_id: validatedData.patient_id,
      specialist_id: auth.specialistId,
      consultation_id: validatedData.consultation_id,
      diagnosis: validatedData.diagnosis,
      treatment_plan: validatedData.treatment_plan,
      prescription: validatedData.prescription,
      notes: validatedData.notes,
    });

    return NextResponse.json({ success: true, data: { id: recordId } }, { status: 201 });
  } catch (error: any) {
    console.error("Create Medical Record Error:", error);
    if (error.issues) {
      return NextResponse.json({ success: false, error: "Validation failed", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
