import { NextRequest, NextResponse } from "next/server";
import { requireSpecialist } from "@/lib/auth/specialist";
import { getPatientDetailsForSpecialist } from "@/lib/db/specialistQueries";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireSpecialist(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const details = await getPatientDetailsForSpecialist(auth.specialistId, id);
    
    if (!details) {
      return NextResponse.json({ success: false, error: "Patient not found or access denied" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: details });
  } catch (error) {
    console.error("Patient Details Error:", error);
    return NextResponse.json({ success: false, error: "Failed to load patient details" }, { status: 500 });
  }
}
