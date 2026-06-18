import { NextRequest, NextResponse } from "next/server";
import { requirePatient } from "@/lib/auth/roles";
import { AppointmentService, AppointmentError } from "@/services/appointment.service";
import { CreateAppointmentSchema } from "@/lib/types/appointment";
import { getOne } from "@/lib/db/client";

export async function POST(req: NextRequest) {
  const auth = requirePatient(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const validatedData = CreateAppointmentSchema.parse(body);

    // Verify patient is booking for themselves
    if (validatedData.patientId !== auth.userId) {
      return NextResponse.json({ success: false, error: "Cannot book appointment for another patient" }, { status: 403 });
    }

    // Verify specialist exists
    const expert = await getOne<{ id: string }>('SELECT id FROM experts WHERE id = ?', [validatedData.specialistId]);
    if (!expert) {
      return NextResponse.json({ success: false, error: "Specialist not found" }, { status: 404 });
    }

    const appointmentId = await AppointmentService.createAppointment(validatedData, auth.userId);

    return NextResponse.json({ 
      success: true, 
      message: "Appointment booked successfully",
      data: { id: appointmentId } 
    }, { status: 201 });

  } catch (error: any) {
    if (error.issues) {
      return NextResponse.json({ success: false, error: "Validation failed", details: error.issues }, { status: 400 });
    }
    if (error instanceof AppointmentError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 409 }); // 409 Conflict
    }
    console.error("Book Appointment Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
