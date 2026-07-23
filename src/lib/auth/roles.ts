import { NextRequest, NextResponse } from "next/server";

export interface SessionData {
  userId: string;
  role: string;
  status: string;
}

export function getSession(req: NextRequest): SessionData | null {
  // Check cookie first (for Web Portal)
  let token = req.cookies.get("auth-token")?.value;
  
  // Fallback to Authorization header (for Mobile App / Flutter Web)
  if (!token) {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  if (!token || !token.startsWith("mock-jwt-")) return null;

  try {
    const payloadStr = token.replace("mock-jwt-", "");
    const decoded = JSON.parse(Buffer.from(payloadStr, "base64").toString("utf-8"));
    return decoded as SessionData;
  } catch (error) {
    return null;
  }
}

export function requirePatient(req: NextRequest): { userId: string } | NextResponse {
  const session = getSession(req);
  
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized: Missing or invalid token" }, { status: 401 });
  }

  if (session.role !== "user") {
    return NextResponse.json({ success: false, error: "Forbidden: Patient access required" }, { status: 403 });
  }

  return { userId: session.userId };
}

export function requireAdmin(req: NextRequest): { adminId: string } | NextResponse {
  const session = getSession(req);
  
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized: Missing or invalid token" }, { status: 401 });
  }

  if (session.role !== "admin") {
    return NextResponse.json({ success: false, error: "Forbidden: Admin access required" }, { status: 403 });
  }

  return { adminId: session.userId };
}
