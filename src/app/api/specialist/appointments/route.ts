import { NextRequest, NextResponse } from "next/server";
import { requireSpecialist } from "@/lib/auth/specialist";
import { AppointmentService } from "@/services/appointment.service";

export async function GET(req: NextRequest) {
  const auth = await requireSpecialist(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const status = searchParams.get("status") || undefined;
    const date = searchParams.get("date") || undefined;
    
    const appointments = await AppointmentService.getSpecialistAppointments(auth.specialistId, { status, date }, limit, offset);
    
    return NextResponse.json({ success: true, data: appointments });
  } catch (error) {
    console.error("Fetch Specialist Appointments Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
