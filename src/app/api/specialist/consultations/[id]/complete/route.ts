import { NextRequest, NextResponse } from "next/server";
import { requireSpecialist } from "@/lib/auth/specialist";
import { executeAction } from "@/lib/db/client";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireSpecialist(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    
    // Explicitly update only if it belongs to this specialist
    const result = await executeAction(
      `UPDATE consultations SET status = 'completed', updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') 
       WHERE id = ? AND expert_id = ?`,
      [id, auth.specialistId]
    );

    if (result.rowsAffected === 0) {
      return NextResponse.json({ success: false, error: "Consultation not found or access denied" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Consultation marked as completed" });
  } catch (error) {
    console.error("Complete Consultation Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
