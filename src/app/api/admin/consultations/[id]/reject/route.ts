import { NextRequest, NextResponse } from 'next/server';
import { executeAction } from '@/lib/db/queries';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const reason = body.cancellationReason || 'Rejected by admin';
    
    await executeAction(
      "UPDATE consultations SET status = 'cancelled', cancellation_reason = ? WHERE id = ?",
      [reason, id]
    );
    
    return NextResponse.json({ success: true, message: 'Consultation rejected and cancelled' });
  } catch (error) {
    console.error('Reject Consultation Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
