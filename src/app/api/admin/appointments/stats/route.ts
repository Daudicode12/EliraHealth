import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/roles";
import { AppointmentService } from "@/services/appointment.service";

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const stats = await AppointmentService.getAppointmentStats();
    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    console.error("Fetch Appointment Stats Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
