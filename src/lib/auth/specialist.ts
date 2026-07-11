import { NextRequest, NextResponse } from "next/server";
import { getExpertByUserId } from "@/lib/db/queries";
import { getSession } from "./roles";

export interface SpecialistSession {
  userId: string;
  specialistId: string;
}

export async function requireSpecialist(req: NextRequest): Promise<SpecialistSession | NextResponse> {
  const sessionOrError = await getSession(req);

  if (sessionOrError instanceof NextResponse) {
    return sessionOrError;
  }

  try {
    if (sessionOrError.role !== "expert") {
      return NextResponse.json({ success: false, error: "Forbidden: Not a specialist" }, { status: 403 });
    }

    const expert = await getExpertByUserId(sessionOrError.userId);
    if (!expert) {
      return NextResponse.json({ success: false, error: "Expert profile not found" }, { status: 404 });
    }

    if (expert.profile_status !== "approved" && expert.verification_status !== "approved") {
      return NextResponse.json({ success: false, error: "Forbidden: Account not approved" }, { status: 403 });
    }

    return { userId: sessionOrError.userId, specialistId: expert.id };
  } catch (error) {
    console.error("Auth helper error:", error);
    return NextResponse.json({ success: false, error: "Unauthorized: Invalid session" }, { status: 401 });
  }
}
