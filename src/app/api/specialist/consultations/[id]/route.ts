import { NextRequest, NextResponse } from "next/server";
import { requireSpecialist } from "@/lib/auth/specialist";
import { getConsultationById } from "@/lib/db/queries";
import { executeAction } from "@/lib/db/client";
import { UpdateConsultationSchema } from "@/lib/types/specialist";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireSpecialist(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const consultation = await getConsultationById(id);

    if (!consultation || consultation.expert_id !== auth.specialistId) {
      return NextResponse.json({ success: false, error: "Consultation not found or access denied" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: consultation });
  } catch (error) {
    console.error("Fetch Consultation Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch consultation" }, { status: 500 });
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
    const consultation = await getConsultationById(id);

    if (!consultation || consultation.expert_id !== auth.specialistId) {
      return NextResponse.json({ success: false, error: "Consultation not found or access denied" }, { status: 404 });
    }

    const body = await req.json();
    const validatedData = UpdateConsultationSchema.parse(body);

    const fields = Object.keys(validatedData);
    if (fields.length === 0) {
       return NextResponse.json({ success: true, data: consultation });
    }

    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const values = fields.map(f => (validatedData as Record<string, unknown>)[f]);

    await executeAction(
      `UPDATE consultations SET ${setClause}, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ? AND expert_id = ?`,
      [...values, id, auth.specialistId]
    );

    return NextResponse.json({ success: true, message: "Consultation updated successfully" });
  } catch (error: any) {
    console.error("Update Consultation Error:", error);
    if (error.issues) {
      return NextResponse.json({ success: false, error: "Validation failed", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
