import { NextRequest, NextResponse } from 'next/server';
import { updateConsultationStatus } from '@/lib/db/queries';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await updateConsultationStatus(id, 'confirmed');
    return NextResponse.json({ success: true, message: 'Consultation approved and confirmed' });
  } catch (error) {
    console.error('Approve Consultation Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
