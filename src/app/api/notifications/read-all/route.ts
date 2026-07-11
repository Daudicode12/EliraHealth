import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/roles";
import { markAllAsRead } from "@/lib/services/notification.service";

export async function PATCH(req: NextRequest) {
  const session = await getSession(req);
  if (session instanceof NextResponse) return session;
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    await markAllAsRead(session.userId);

    return NextResponse.json({ 
      success: true, 
      message: "All notifications marked as read" 
    }, { status: 200 });

  } catch (error: any) {
    console.error("Mark All Read Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
