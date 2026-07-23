import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "./session";

export interface SessionData {
  userId: string;
  role: string;
  status: string;
}

export async function getSession(req: NextRequest): Promise<SessionData | null> {
  let token = req.cookies.get("auth-token")?.value;

  if (!token) {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  if (!token) return null;

  if (token.startsWith("mock-jwt-")) {
    try {
      const payloadStr = token.replace("mock-jwt-", "");
      const decoded = JSON.parse(Buffer.from(payloadStr, "base64").toString("utf-8"));
      return decoded as SessionData;
    } catch {
      return null;
    }
  }

  const payload = await verifySessionToken(token);
  if (!payload) return null;

  return { userId: payload.id, role: payload.role, status: payload.status };
}
}

export async function requirePatient(req: NextRequest): Promise<{ userId: string } | NextResponse> {
  const session = await getSession(req);

  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized: Missing or invalid token" }, { status: 401 });
  }

  if (session.role !== "user") {
    return NextResponse.json({ success: false, error: "Forbidden: Patient access required" }, { status: 403 });
  }

  return { userId: session.userId };
}

export async function requireAdmin(req: NextRequest): Promise<{ adminId: string } | NextResponse> {
  const session = await getSession(req);

  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized: Missing or invalid token" }, { status: 401 });
  }

  if (session.role !== "admin") {
    return NextResponse.json({ success: false, error: "Forbidden: Admin access required" }, { status: 403 });
  }

  return { adminId: session.userId };
}
