import { NextRequest, NextResponse } from 'next/server';
import { approveExpert } from '@/lib/db/queries';
import { cookies } from 'next/headers';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get current admin ID from cookie
    const token = (await cookies()).get("auth-token")?.value;
    const adminId = token?.replace("mock-token-", "") || 'system';

    await approveExpert(id, adminId);
    
    // TODO: Create notification
    
    return NextResponse.json({ success: true, message: 'Expert approved successfully' });
  } catch (error) {
    console.error('Approve Expert Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
