import { NextRequest, NextResponse } from "next/server";
import { requireSpecialist } from "@/lib/auth/specialist";
import { getMedicalRecordById, updateMedicalRecord } from "@/lib/db/specialistQueries";
import { UpdateMedicalRecordSchema } from "@/lib/types/specialist";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireSpecialist(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const record = await getMedicalRecordById(auth.specialistId, id);

    if (!record) {
      return NextResponse.json({ success: false, error: "Medical record not found or access denied" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: record });
  } catch (error) {
    console.error("Fetch Medical Record Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch medical record" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireSpecialist(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    
    // Verify existence and ownership
    const existingRecord = await getMedicalRecordById(auth.specialistId, id);
    if (!existingRecord) {
      return NextResponse.json({ success: false, error: "Medical record not found or access denied" }, { status: 404 });
    }

    const body = await req.json();
    const validatedData = UpdateMedicalRecordSchema.parse(body);

    await updateMedicalRecord(id, auth.specialistId, validatedData);

    return NextResponse.json({ success: true, message: "Medical record updated successfully" });
  } catch (error: any) {
    console.error("Update Medical Record Error:", error);
    if (error.issues) {
      return NextResponse.json({ success: false, error: "Validation failed", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
