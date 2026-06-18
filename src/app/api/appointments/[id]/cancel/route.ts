import { NextRequest, NextResponse } from "next/server";
import { requirePatient } from "@/lib/auth/roles";
import { AppointmentService } from "@/services/appointment.service";
import { getOne } from "@/lib/db/client";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requirePatient(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    
    // Verify ownership
    const appt = await getOne<{ patient_id: string, status: string }>('SELECT patient_id, status FROM appointments WHERE id = ?', [id]);
    if (!appt) {
      return NextResponse.json({ success: false, error: "Appointment not found" }, { status: 404 });
    }
    if (appt.patient_id !== auth.userId) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    if (appt.status === 'CANCELLED' || appt.status === 'COMPLETED') {
      return NextResponse.json({ success: false, error: `Cannot cancel a ${appt.status.toLowerCase()} appointment` }, { status: 400 });
    }

    await AppointmentService.cancelAppointment(id);

    return NextResponse.json({ success: true, message: "Appointment cancelled successfully" });
  } catch (error) {
    console.error("Cancel Appointment Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
