import { NextRequest, NextResponse } from 'next/server';
import { getConsultationMessages, sendConsultationMessage } from '@/lib/db/queries';
import { z } from 'zod';

const messageSchema = z.object({
  senderId: z.string(),
  content: z.string(),
  messageType: z.enum(['text', 'image', 'file', 'system']).optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const messages = await getConsultationMessages(id);
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Fetch Messages Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validatedData = messageSchema.parse(body);
    
    await sendConsultationMessage({
      consultation_id: id,
      sender_id: validatedData.senderId,
      content: validatedData.content,
      message_type: validatedData.messageType || 'text',
    });
    
    return NextResponse.json({ success: true, message: 'Message sent' }, { status: 201 });
  } catch (error) {
    console.error('Send Message Error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
