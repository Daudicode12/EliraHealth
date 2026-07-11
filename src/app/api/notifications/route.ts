import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/roles";
import { getUserNotifications } from "@/lib/services/notification.service";

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (session instanceof NextResponse) return session;
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const limitUrlStr = req.nextUrl.searchParams.get('limit');
    const limit = limitUrlStr ? parseInt(limitUrlStr) : 50;
    
    const notifications = await getUserNotifications(session.userId, limit);

    return NextResponse.json({ 
      success: true, 
      data: notifications 
    }, { status: 200 });

  } catch (error: any) {
    console.error("Get Notifications Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
