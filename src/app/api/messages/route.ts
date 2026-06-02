import { NextRequest, NextResponse } from "next/server";
import { getMessages, sendMessage } from "@/lib/services/messageService";

export async function GET(req: NextRequest) {
  const consultationId = req.nextUrl.searchParams.get("consultationId");
  if (!consultationId) return NextResponse.json({ error: "consultationId required" }, { status: 400 });
  const messages = await getMessages(consultationId);
  return NextResponse.json(messages);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { consultation_id, sender_id, sender_role, message, attachment_url } = body;
  if (!consultation_id || !sender_id || !sender_role || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const msg = await sendMessage({ consultation_id, sender_id, sender_role, message, attachment_url });
  return NextResponse.json(msg, { status: 201 });
}
