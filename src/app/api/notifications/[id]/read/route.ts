import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/roles";
import { markAsRead } from "@/lib/services/notification.service";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession(req);
  if (session instanceof NextResponse) return session;
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await markAsRead(id, session.userId);

    return NextResponse.json({ 
      success: true, 
      message: "Notification marked as read" 
    }, { status: 200 });

  } catch (error: any) {
    console.error("Mark Notification Read Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
