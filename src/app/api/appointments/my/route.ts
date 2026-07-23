import { NextRequest, NextResponse } from "next/server";
import { requirePatient } from "@/lib/auth/roles";
import { AppointmentService } from "@/services/appointment.service";

export async function GET(req: NextRequest) {
  const auth = await requirePatient(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    // Could add more filters here if needed
    
    const appointments = await AppointmentService.getPatientAppointments(auth.userId, limit, offset);
    
    return NextResponse.json({ success: true, data: appointments });
  } catch (error) {
    console.error("Fetch My Appointments Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
