import { NextRequest, NextResponse } from "next/server";
import { requireSpecialist } from "@/lib/auth/specialist";
import { getExpertAvailability, createAvailability } from "@/lib/db/queries";
import { AvailabilitySchema } from "@/lib/types/specialist";

export async function GET(req: NextRequest) {
  const auth = await requireSpecialist(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const availability = await getExpertAvailability(auth.specialistId);
    return NextResponse.json({ success: true, data: availability });
  } catch (error) {
    console.error("Fetch Availability Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch availability" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireSpecialist(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const validatedData = AvailabilitySchema.parse(body);

    await createAvailability({
      expert_id: auth.specialistId,
      day_of_week: validatedData.day_of_week,
      start_time: validatedData.start_time,
      end_time: validatedData.end_time,
    });

    return NextResponse.json({ success: true, message: "Availability created successfully" }, { status: 201 });
  } catch (error: any) {
    console.error("Create Availability Error:", error);
    if (error.issues) {
      return NextResponse.json({ success: false, error: "Validation failed", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
