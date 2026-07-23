import { NextRequest, NextResponse } from 'next/server';
import { rejectExpert } from '@/lib/db/queries';
import { requireAdmin } from '@/lib/auth/roles';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    await rejectExpert(id, 'Rejected by admin via API');
    return NextResponse.json({ success: true, message: 'Expert rejected and removed' });
  } catch (error) {
    console.error('Reject Expert Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
