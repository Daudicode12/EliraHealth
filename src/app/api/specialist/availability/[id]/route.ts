import { NextRequest, NextResponse } from "next/server";
import { requireSpecialist } from "@/lib/auth/specialist";
import { executeAction } from "@/lib/db/client";
import { AvailabilitySchema } from "@/lib/types/specialist";
import { getOne } from "@/lib/db/client";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireSpecialist(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    
    // Verify ownership
    const existing = await getOne<{ id: string }>('SELECT id FROM expert_availability WHERE id = ? AND expert_id = ?', [id, auth.specialistId]);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Availability slot not found or access denied" }, { status: 404 });
    }

    const body = await req.json();
    const validatedData = AvailabilitySchema.parse(body);

    await executeAction(
      `UPDATE expert_availability SET day_of_week = ?, start_time = ?, end_time = ? WHERE id = ? AND expert_id = ?`,
      [validatedData.day_of_week, validatedData.start_time, validatedData.end_time, id, auth.specialistId]
    );

    return NextResponse.json({ success: true, message: "Availability updated successfully" });
  } catch (error: any) {
    console.error("Update Availability Error:", error);
    if (error.issues) {
      return NextResponse.json({ success: false, error: "Validation failed", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireSpecialist(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    
    const result = await executeAction(
      `DELETE FROM expert_availability WHERE id = ? AND expert_id = ?`,
      [id, auth.specialistId]
    );

    if (result.rowsAffected === 0) {
      return NextResponse.json({ success: false, error: "Availability slot not found or access denied" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Availability slot deleted" });
  } catch (error) {
    console.error("Delete Availability Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
