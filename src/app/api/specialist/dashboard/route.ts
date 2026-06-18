import { NextRequest, NextResponse } from "next/server";
import { requireSpecialist } from "@/lib/auth/specialist";
import { getSpecialistDashboardStats } from "@/lib/db/specialistQueries";
import { AppointmentService } from "@/services/appointment.service";

export async function GET(req: NextRequest) {
  const auth = await requireSpecialist(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const [stats, appointmentMetrics] = await Promise.all([
      getSpecialistDashboardStats(auth.specialistId),
      AppointmentService.getSpecialistDashboardMetrics(auth.specialistId)
    ]);
    
    return NextResponse.json({ 
      success: true, 
      data: {
        ...stats,
        ...appointmentMetrics
      } 
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return NextResponse.json({ success: false, error: "Failed to load dashboard data" }, { status: 500 });
  }
}
