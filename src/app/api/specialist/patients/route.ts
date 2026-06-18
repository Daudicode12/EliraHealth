import { NextRequest, NextResponse } from "next/server";
import { requireSpecialist } from "@/lib/auth/specialist";
import { getAssignedPatients } from "@/lib/db/specialistQueries";

export async function GET(req: NextRequest) {
  const auth = await requireSpecialist(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const patients = await getAssignedPatients(auth.specialistId);
    return NextResponse.json({ success: true, data: patients });
  } catch (error) {
    console.error("Assigned Patients Error:", error);
    return NextResponse.json({ success: false, error: "Failed to load assigned patients" }, { status: 500 });
  }
}
