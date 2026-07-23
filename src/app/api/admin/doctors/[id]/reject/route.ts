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
    const body = await req.json();
    const { reason } = body;

    if (!reason) {
      return NextResponse.json({ success: false, error: 'Rejection reason is required' }, { status: 400 });
    }

    await rejectExpert(id, reason);

    return NextResponse.json({ success: true, message: 'Expert application rejected' });
  } catch (error) {
    console.error('Reject Expert Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
