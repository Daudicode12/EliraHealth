import { NextRequest, NextResponse } from "next/server";
import { processReminders } from "@/lib/services/reminder.service";

export async function GET(req: NextRequest) {
  // Validate a cron secret to secure the route
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    await processReminders();
    return NextResponse.json({ success: true, message: "Reminders processed successfully" });
  } catch (error: any) {
    console.error("Process Reminders Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
