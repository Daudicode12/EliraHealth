import { NextRequest, NextResponse } from "next/server";
import { getExpertByUserId } from "@/lib/db/queries";
import { verifySessionToken } from "./session";

export interface SpecialistSession {
  userId: string;
  specialistId: string;
}

export async function requireSpecialist(req: NextRequest): Promise<SpecialistSession | NextResponse> {
  const token = req.cookies.get("auth-token")?.value;

  if (!token) {
    return NextResponse.json({ success: false, error: "Unauthorized: Missing token" }, { status: 401 });
  }

  const decoded = await verifySessionToken(token);
  if (!decoded) {
    return NextResponse.json({ success: false, error: "Unauthorized: Invalid session" }, { status: 401 });
  }

  try {
    const { id, role, status } = decoded;

    if (role !== "expert") {
      return NextResponse.json({ success: false, error: "Forbidden: Not a specialist" }, { status: 403 });
    }

    if (status !== "approved") {
      return NextResponse.json({ success: false, error: "Forbidden: Account not approved" }, { status: 403 });
    }

    const expert = await getExpertByUserId(id);
    if (!expert) {
      return NextResponse.json({ success: false, error: "Expert profile not found" }, { status: 404 });
    }

    return { userId: id, specialistId: expert.id };
  } catch (error) {
    console.error("Auth helper error:", error);
    return NextResponse.json({ success: false, error: "Unauthorized: Invalid session" }, { status: 401 });
  }
}
