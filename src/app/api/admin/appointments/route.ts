import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/roles";
import { AppointmentService } from "@/services/appointment.service";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const status = searchParams.get("status") || undefined;
    const specialistId = searchParams.get("specialistId") || undefined;
    const patientId = searchParams.get("patientId") || undefined;
    
    const appointments = await AppointmentService.getAllAppointments(
      { status, specialistId, patientId }, 
      limit, 
      offset
    );
    
    return NextResponse.json({ success: true, data: appointments });
  } catch (error) {
    console.error("Fetch All Appointments Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
