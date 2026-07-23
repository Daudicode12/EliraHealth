import { NextRequest, NextResponse } from 'next/server';
import { approveExpert } from '@/lib/db/queries';
import { requireAdmin } from '@/lib/auth/roles';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin(req);
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;
    await approveExpert(id, auth.adminId);

    return NextResponse.json({ success: true, message: 'Expert approved successfully' });
  } catch (error) {
    console.error('Approve Expert Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
