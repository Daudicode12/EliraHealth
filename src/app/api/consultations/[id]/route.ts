import { NextRequest, NextResponse } from 'next/server';
import { updateConsultationStatus, executeAction } from '@/lib/db/queries';
import { z } from 'zod';

const statusSchema = z.object({
  status: z.enum(['confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = statusSchema.parse(body);
    
    await updateConsultationStatus(id, status);
    
    return NextResponse.json({ success: true, message: `Consultation updated to ${status}` });
  } catch (error) {
    console.error('Update Consultation Error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await executeAction("UPDATE consultations SET status = 'cancelled' WHERE id = ?", [id]);
    return NextResponse.json({ success: true, message: 'Consultation cancelled' });
  } catch (error) {
    console.error('Cancel Consultation Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
