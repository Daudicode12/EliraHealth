import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./jwt";
import { getOne } from "../db/queries";
import { Profile } from "../db/types";

export interface SessionData {
  userId: string;
  role: string;
  status: string;
}

export async function getSession(req: NextRequest): Promise<SessionData | NextResponse> {
  const authHeader = req.headers.get("authorization");
  let token = req.cookies.get("auth-token")?.value;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  }

  if (!token) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ success: false, error: "Unauthorized: Invalid or expired token" }, { status: 401 });
  }

  // Database verification
  const profile = await getOne<Profile>("SELECT id, status, role FROM profiles WHERE id = ?", [payload.userId]);

  if (!profile) {
    return NextResponse.json({ success: false, error: "Unauthorized: User not found" }, { status: 401 });
  }

  const status = profile.status || "active";
  if (status === "deleted" || status === "suspended" || status === "inactive") {
    return NextResponse.json({ success: false, error: `Unauthorized: User is ${status}` }, { status: 403 });
  }

  return {
    userId: profile.id,
    role: profile.role,
    status: status
  };
}

export async function requirePatient(req: NextRequest): Promise<{ userId: string } | NextResponse> {
  const sessionOrError = await getSession(req);
  
  if (sessionOrError instanceof NextResponse) {
    return sessionOrError;
  }

  if (sessionOrError.role !== "user") {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  return { userId: sessionOrError.userId };
}

export async function requireAdmin(req: NextRequest): Promise<{ adminId: string } | NextResponse> {
  const sessionOrError = await getSession(req);
  
  if (sessionOrError instanceof NextResponse) {
    return sessionOrError;
  }

  if (sessionOrError.role !== "admin") {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  return { adminId: sessionOrError.userId };
}
