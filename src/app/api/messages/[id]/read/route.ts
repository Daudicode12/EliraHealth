import { NextRequest, NextResponse } from 'next/server';
import { markMessageAsRead } from '@/lib/db/queries';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await markMessageAsRead(id);
    return NextResponse.json({ success: true, message: 'Message marked as read' });
  } catch (error) {
    console.error('Mark Message Read Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
