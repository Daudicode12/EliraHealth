import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/roles";
import { getOne } from "@/lib/db/client";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession(req);
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    
    const appointment = await getOne<any>(
      `SELECT a.*, e.display_name as specialist_name, p.first_name as patient_first_name, p.last_name as patient_last_name
       FROM appointments a
       JOIN experts e ON a.specialist_id = e.id
       JOIN profiles p ON a.patient_id = p.id
       WHERE a.id = ?`,
      [id]
    );

    if (!appointment) {
      return NextResponse.json({ success: false, error: "Appointment not found" }, { status: 404 });
    }

    // Access control: only patient, specialist, or admin can view
    const isOwner = session.role === 'user' && appointment.patient_id === session.userId;
    const isSpecialist = session.role === 'expert' && appointment.specialist_id === session.userId;
    const isAdmin = session.role === 'admin';

    if (!isOwner && !isSpecialist && !isAdmin) {
      return NextResponse.json({ success: false, error: "Forbidden: Access denied" }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: appointment });
  } catch (error) {
    console.error("Fetch Appointment Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
