import { NextRequest, NextResponse } from 'next/server';
import { suspendExpert } from '@/lib/db/queries';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await suspendExpert(id);
    
    // TODO: Create notification
    
    return NextResponse.json({ success: true, message: 'Expert account suspended' });
  } catch (error) {
    console.error('Suspend Expert Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
