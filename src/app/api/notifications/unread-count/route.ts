import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/roles";
import { getUnreadCount } from "@/lib/services/notification.service";

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (session instanceof NextResponse) return session;
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const count = await getUnreadCount(session.userId);

    return NextResponse.json({ 
      success: true, 
      data: { count } 
    }, { status: 200 });

  } catch (error: any) {
    console.error("Get Unread Count Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
