import { NextRequest, NextResponse } from "next/server";
import { requireSpecialist } from "@/lib/auth/specialist";
import { getSpecialistDashboardStats } from "@/lib/db/specialistQueries";

export async function GET(req: NextRequest) {
  const auth = await requireSpecialist(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const stats = await getSpecialistDashboardStats(auth.specialistId);
    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return NextResponse.json({ success: false, error: "Failed to load dashboard data" }, { status: 500 });
  }
}
