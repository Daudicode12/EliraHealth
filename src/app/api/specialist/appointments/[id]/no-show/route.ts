import { NextRequest, NextResponse } from "next/server";
import { requireSpecialist } from "@/lib/auth/specialist";
import { AppointmentService } from "@/services/appointment.service";
import { getOne } from "@/lib/db/client";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireSpecialist(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    
    // Verify ownership
    const appt = await getOne<{ specialist_id: string }>('SELECT specialist_id FROM appointments WHERE id = ?', [id]);
    if (!appt || appt.specialist_id !== auth.specialistId) {
      return NextResponse.json({ success: false, error: "Appointment not found or access denied" }, { status: 404 });
    }

    await AppointmentService.markNoShow(id);
    return NextResponse.json({ success: true, message: "Appointment marked as no-show" });
  } catch (error) {
    console.error("No-Show Appointment Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
