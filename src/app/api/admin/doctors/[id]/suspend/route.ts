import { NextRequest, NextResponse } from 'next/server';
import { suspendExpert } from '@/lib/db/queries';
import { requireAdmin } from '@/lib/auth/roles';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;

    await suspendExpert(id);

    return NextResponse.json({ success: true, message: 'Expert account suspended' });
  } catch (error) {
    console.error('Suspend Expert Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
