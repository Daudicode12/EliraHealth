import { NextRequest, NextResponse } from 'next/server';
import { rejectExpert } from '@/lib/db/queries';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { reason } = body;

    if (!reason) {
      return NextResponse.json({ success: false, error: 'Rejection reason is required' }, { status: 400 });
    }

    await rejectExpert(id, reason);
    
    // TODO: Create notification
    
    return NextResponse.json({ success: true, message: 'Expert application rejected' });
  } catch (error) {
    console.error('Reject Expert Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
