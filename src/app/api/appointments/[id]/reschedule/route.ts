import { NextRequest, NextResponse } from "next/server";
import { requirePatient } from "@/lib/auth/roles";
import { AppointmentService, AppointmentError } from "@/services/appointment.service";
import { RescheduleAppointmentSchema } from "@/lib/types/appointment";
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

    const body = await req.json();
    const validatedData = RescheduleAppointmentSchema.parse(body);

    await AppointmentService.rescheduleAppointment(
      id, 
      validatedData.appointmentDate, 
      validatedData.startTime, 
      validatedData.endTime
    );

    return NextResponse.json({ success: true, message: "Appointment rescheduled successfully" });
  } catch (error: any) {
    if (error.issues) {
      return NextResponse.json({ success: false, error: "Validation failed", details: error.issues }, { status: 400 });
    }
    if (error instanceof AppointmentError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 409 });
    }
    console.error("Reschedule Appointment Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
